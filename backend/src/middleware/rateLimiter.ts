import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  }
}

// In-memory store for rate limiting (v produkci použijte Redis)
const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

export const createRateLimit = (
  windowMs: number, // Time window in milliseconds
  maxRequests: number, // Maximum requests per window
  message: string = 'Příliš mnoho požadavků, zkuste to později'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `${identifier}:${req.route?.path || req.path}`;

    // Get or create rate limit entry
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      rateLimitStore[key].count++;
    }

    const { count, resetTime } = rateLimitStore[key];

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - count).toString(),
      'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString()
    });

    if (count > maxRequests) {
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      
      res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfter
      });
      return;
    }

    next();
  };
};

// Predefined rate limiters
export const registerRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  3, // max 3 registrations per 15 minutes per IP
  'Příliš mnoho pokusů o registraci. Zkuste to za 15 minut.'
);

export const loginRateLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  10, // max 10 login attempts per 5 minutes per IP
  'Příliš mnoho pokusů o přihlášení. Zkuste to za 5 minut.'
);

export const generalApiRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  60, // max 60 requests per minute per IP
  'Příliš mnoho požadavků. Zkuste to později.'
);
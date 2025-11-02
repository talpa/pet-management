import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';
import { v4 as uuidv4 } from 'uuid';

// Rozšířím Request interface o audit data
declare module 'express-serve-static-core' {
  interface Request {
    sessionId?: string;
    startTime?: number;
  }
}

export const auditMiddleware = (action?: string, resource?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Generuji session ID pro tento request
    req.sessionId = uuidv4();
    req.startTime = Date.now();

    // Získám IP adresu
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';
    
    // Získám user agent
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Určím action a resource
    const auditAction = action || `${req.method} ${req.route?.path || req.path}`;
    const auditResource = resource || extractResourceFromPath(req.path);

    // Připravím metadata
    const metadata: any = {
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': userAgent,
        'referer': req.headers['referer'],
      },
    };

    // Přidám body pro POST/PUT/PATCH (ale bez citlivých dat)
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      metadata.body = sanitizeBody(req.body);
    }

    try {
      // Uložím audit log
      await AuditLog.create({
        userId: (req as any).user?.id || null,
        sessionId: req.sessionId,
        action: auditAction,
        resource: auditResource,
        ipAddress,
        userAgent,
        method: req.method,
        url: req.url,
        statusCode: null, // Bude doplněno v response handleru
        responseTime: null, // Bude doplněno v response handleru
        metadata,
      });
    } catch (error) {
      console.error('Audit logging error:', error);
      // Nepřerušíme request kvůli chybě v audit logu
    }

    // Přidám response handler
    const originalSend = res.send;
    res.send = function(body) {
      // Aktualizuji audit log s response daty
      updateAuditLogResponse(req, res, body);
      return originalSend.call(this, body);
    };

    next();
  };
};

// Funkce pro aktualizaci audit logu s response daty
async function updateAuditLogResponse(req: Request, res: Response, responseBody: any) {
  if (!req.sessionId) return;

  const responseTime = req.startTime ? Date.now() - req.startTime : null;
  
  try {
    await AuditLog.update(
      {
        statusCode: res.statusCode,
        responseTime,
        metadata: {
          ...(await AuditLog.findOne({ where: { sessionId: req.sessionId } }))?.metadata,
          response: {
            statusCode: res.statusCode,
            size: JSON.stringify(responseBody).length,
            hasError: res.statusCode >= 400,
          },
        },
      },
      {
        where: { sessionId: req.sessionId },
      }
    );
  } catch (error) {
    console.error('Audit log update error:', error);
  }
}

// Funkce pro extrakci resource z path
function extractResourceFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  
  if (segments[0] === 'api') {
    return segments[1] || 'unknown';
  }
  
  return segments[0] || 'unknown';
}

// Funkce pro sanitizaci body (odstranění citlivých dat)
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Middleware pro logování specifických user actions
export const logUserAction = (action: string, resource: string) => {
  return auditMiddleware(action, resource);
};

// Middleware pre logování admin actions
export const logAdminAction = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ověřím admin role (používám správne pole role)
    if (!(req as any).user || (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    return auditMiddleware(`ADMIN_${action}`, resource)(req, res, next);
  };
};
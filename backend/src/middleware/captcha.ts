import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CaptchaStore {
  [key: string]: {
    answer: number;
    expires: number;
  }
}

// In-memory store pro CAPTCHA (v produkci použijte Redis)
const captchaStore: CaptchaStore = {};

// Cleanup expired captchas every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(captchaStore).forEach(key => {
    if (captchaStore[key].expires < now) {
      delete captchaStore[key];
    }
  });
}, 10 * 60 * 1000);

// Generate simple math CAPTCHA
export const generateCaptcha = (req: Request, res: Response) => {
  try {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer: number;
    let question: string;
    
    switch (operator) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        answer = Math.max(num1, num2) - Math.min(num1, num2);
        question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`;
        break;
      case '*':
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }
    
    // Generate unique token
    const token = crypto.randomBytes(16).toString('hex');
    
    // Store CAPTCHA (expires in 10 minutes)
    captchaStore[token] = {
      answer,
      expires: Date.now() + 10 * 60 * 1000
    };
    
    res.json({
      success: true,
      data: {
        token,
        question: `Kolik je ${question}?`,
        expires: 10 * 60 // seconds
      }
    });
  } catch (error) {
    console.error('CAPTCHA generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při generování CAPTCHA'
    });
  }
};

// Validate CAPTCHA
export const validateCaptcha = (req: Request, res: Response, next: NextFunction) => {
  const { captchaToken, captchaAnswer } = req.body;
  
  if (!captchaToken || captchaAnswer === undefined) {
    res.status(400).json({
      success: false,
      message: 'CAPTCHA je povinná pro registraci.',
      code: 'CAPTCHA_REQUIRED'
    });
    return;
  }
  
  const captchaData = captchaStore[captchaToken];
  
  if (!captchaData) {
    res.status(400).json({
      success: false,
      message: 'CAPTCHA token je neplatný nebo vypršel.',
      code: 'CAPTCHA_INVALID'
    });
    return;
  }
  
  if (captchaData.expires < Date.now()) {
    delete captchaStore[captchaToken];
    res.status(400).json({
      success: false,
      message: 'CAPTCHA vypršela. Vygenerujte novou.',
      code: 'CAPTCHA_EXPIRED'
    });
    return;
  }
  
  const userAnswer = parseInt(captchaAnswer);
  if (isNaN(userAnswer) || userAnswer !== captchaData.answer) {
    res.status(400).json({
      success: false,
      message: 'Nesprávná odpověď na CAPTCHA.',
      code: 'CAPTCHA_WRONG'
    });
    return;
  }
  
  // CAPTCHA is valid, remove it and continue
  delete captchaStore[captchaToken];
  next();
};
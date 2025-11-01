import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .custom((value) => {
      // Allow empty/null/undefined phone
      if (!value || value.trim() === '') {
        return true;
      }
      // If phone is provided, validate it
      return /^[\+]?[1-9][\d]{0,15}$/.test(value) || /^[\d\s\-\+\(\)]{7,}$/.test(value);
    })
    .withMessage('Please provide a valid phone number'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must not exceed 100 characters'),
  
  body('role')
    .trim()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }
    next();
  },
];
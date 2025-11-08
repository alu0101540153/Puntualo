import { Request, Response, NextFunction } from 'express';

// Middleware sencillo para validar el cuerpo al crear un usuario
export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  const errors: { field: string; message: string }[] = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  return next();
};

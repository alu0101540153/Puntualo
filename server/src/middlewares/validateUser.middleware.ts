import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models'

// Middleware para validar el cuerpo al crear un usuario y comprobar unicidad
export const validateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, handle } = req.body;
  const errors: { field: string; message: string }[] = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'El nombre es obligatorio' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Introduce un correo electrónico válido' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push({ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  if (!handle || typeof handle !== 'string' || handle.trim().length === 0) {
    // fallback: if handle not provided, not a fatal error here — frontend maps username -> handle
    // but still include validation
    errors.push({ field: 'handle', message: 'El nombre de usuario es obligatorio' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Check uniqueness in DB for email and handle
  try {
    const existingEmail = await UserModel.findOne({ email }).lean()
    if (existingEmail) {
      return res.status(409).json({ errors: [{ field: 'email', message: 'Ya existe un usuario registrado con ese correo electrónico.' }] })
    }

    const existingHandle = await UserModel.findOne({ handle }).lean()
    if (existingHandle) {
      return res.status(409).json({ errors: [{ field: 'handle', message: 'El nombre de usuario ya está en uso.' }] })
    }
  } catch (err: any) {
    return res.status(500).json({ message: 'Error checking user uniqueness' })
  }

  return next();
}

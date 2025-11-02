const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para verificar el token JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado. Token no proporcionado.' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const userModel = new User();
    const user = await userModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Token inválido. Usuario no encontrado.' 
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en auth middleware:', error);
    res.status(401).json({ 
      error: 'Token inválido o expirado.' 
    });
  }
};

module.exports = authMiddleware;
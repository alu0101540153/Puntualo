const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const authController = {
  /**
   * Registro de nuevo usuario
   */
  async register(req, res) {
    try {
      const { username, email, password, favoriteGenres } = req.body;

      console.log(`Intentando registrar usuario: ${email}`);

      // Validaciones básicas
      if (!username || !email || !password) {
        console.log('Datos incompletos en registro');
        return res.status(400).json({
          error: 'Username, email y password son requeridos'
        });
      }

      if (password.length < 6) {
        console.log('Contraseña demasiado corta');
        return res.status(400).json({
          error: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      const userModel = new User();

      // Verificar si el usuario ya existe
      console.log(`🔍 Verificando existencia de usuario: ${email}`);
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        console.log(`Email ya registrado: ${email}`);
        return res.status(400).json({
          error: 'El email ya está registrado'
        });
      }

      const existingUsername = await userModel.findByUsername(username);
      if (existingUsername) {
        console.log(`Username ya en uso: ${username}`);
        return res.status(400).json({
          error: 'El username ya está en uso'
        });
      }

      // Crear usuario
      console.log(`👤 Creando usuario: ${username}`);
      const userData = {
        username,
        email,
        password,
        favoriteGenres: favoriteGenres || []
      };

      const user = await userModel.create(userData);

      // Generar token
      const token = generateToken(user._id.toString());

      // Excluir password de la respuesta
      const { password: _, ...userWithoutPassword } = user;

      console.log(`Usuario registrado exitosamente: ${email}`);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: userWithoutPassword,
        token
      });

    } catch (error) {
      console.error('Error en registro:', error.message);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        error: 'Error interno del servidor',
        // Solo mostrar detalles en desarrollo
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.message 
        })
      });
    }
  },

  /**
   * Login de usuario
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log(`Intentando login: ${email}`);

      // Validaciones
      if (!email || !password) {
        console.log('Datos incompletos en login');
        return res.status(400).json({
          error: 'Email y password son requeridos'
        });
      }

      const userModel = new User();

      // Buscar usuario
      console.log(`Buscando usuario: ${email}`);
      const user = await userModel.findByEmail(email);
      if (!user) {
        console.log(`Usuario no encontrado: ${email}`);
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Verificar password
      console.log(`Verificando contraseña para: ${email}`);
      const isPasswordValid = await userModel.comparePassword(password, user.password);
      if (!isPasswordValid) {
        console.log(`Contraseña incorrecta para: ${email}`);
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Generar token
      const token = generateToken(user._id.toString());

      // Excluir password de la respuesta
      const { password: _, ...userWithoutPassword } = user;

      console.log(`Login exitoso: ${email}`);

      res.json({
        message: 'Login exitoso',
        user: userWithoutPassword,
        token
      });

    } catch (error) {
      console.error('Error en login:', error.message);
      res.status(500).json({
        error: 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.message 
        })
      });
    }
  },

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(req, res) {
    try {
      console.log(`Solicitando perfil para: ${req.user.email}`);
      
      // El usuario ya está en req.user gracias al middleware auth
      const { password, ...userWithoutPassword } = req.user;
      
      console.log(`Perfil entregado: ${req.user.email}`);
      
      res.json({
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error obteniendo perfil:', error.message);
      res.status(500).json({
        error: 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.message 
        })
      });
    }
  }
};

module.exports = authController;
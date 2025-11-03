const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Registro
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Perfil del usuario (requiere autenticación)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
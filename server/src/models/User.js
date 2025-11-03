const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

class User {
  constructor() {
    this.collection = getDB().collection('users');
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async create(userData) {
    try {
      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        avatar: userData.avatar || '/assets/default-avatar.png',
        bio: userData.bio || '',
        friends: [],
        favoriteGenres: userData.favoriteGenres || [],
        readingGoals: {
          books: 0,
          movies: 0,
          series: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.collection.insertOne(user);
      return { _id: result.insertedId, ...user };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Encuentra usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findByEmail(email) {
    return await this.collection.findOne({ email });
  }

  /**
   * Encuentra usuario por username
   * @param {string} username - Username del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findByUsername(username) {
    return await this.collection.findOne({ username });
  }

  /**
   * Encuentra usuario por ID
   * @param {string} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  /**
   * Verifica si la contraseña es correcta
   * @param {string} candidatePassword - Contraseña a verificar
   * @param {string} hashedPassword - Contraseña hasheada
   * @returns {Promise<boolean>} True si coincide
   */
  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  /**
   * Actualiza el perfil del usuario
   * @param {string} id - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Resultado de la actualización
   */
  async updateProfile(id, updateData) {
    const updateFields = {
      ...updateData,
      updatedAt: new Date()
    };

    return await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
  }

  /**
   * Agrega un amigo
   * @param {string} userId - ID del usuario
   * @param {string} friendId - ID del amigo a agregar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async addFriend(userId, friendId) {
    return await this.collection.updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { friends: new ObjectId(friendId) } }
    );
  }
}

module.exports = User;
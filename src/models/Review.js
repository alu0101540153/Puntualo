const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class Review {
  constructor() {
    this.collection = getDB().collection('reviews');
  }

  /**
   * Crea una nueva reseña
   * @param {Object} reviewData - Datos de la reseña
   * @returns {Promise<Object>} Reseña creada
   */
  async create(reviewData) {
    try {
      const review = {
        userId: new ObjectId(reviewData.userId),
        contentId: new ObjectId(reviewData.contentId),
        rating: reviewData.rating,
        review: reviewData.review || '',
        status: reviewData.status, // 'watching', 'completed', etc.
        progress: reviewData.progress || 0,
        isPublic: reviewData.isPublic !== false,
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Verificar que no existe ya una reseña del mismo usuario para el mismo contenido
      const existingReview = await this.collection.findOne({
        userId: review.userId,
        contentId: review.contentId
      });

      if (existingReview) {
        throw new Error('Ya existe una reseña para este contenido');
      }

      const result = await this.collection.insertOne(review);
      return { _id: result.insertedId, ...review };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene reseñas de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de reseñas
   */
  async findByUser(userId) {
    return await this.collection.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $lookup: {
          from: 'content',
          localField: 'contentId',
          foreignField: '_id',
          as: 'content'
        }
      },
      { $unwind: '$content' }
    ]).toArray();
  }

  /**
   * Obtiene reseñas de un contenido
   * @param {string} contentId - ID del contenido
   * @returns {Promise<Array>} Lista de reseñas
   */
  async findByContent(contentId) {
    return await this.collection.aggregate([
      { $match: { contentId: new ObjectId(contentId), isPublic: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $project: { 'user.password': 0 } } // Excluir password
    ]).toArray();
  }

  /**
   * Actualiza una reseña
   * @param {string} reviewId - ID de la reseña
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Resultado de la actualización
   */
  async update(reviewId, updateData) {
    const updateFields = {
      ...updateData,
      updatedAt: new Date()
    };

    return await this.collection.updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: updateFields }
    );
  }
}

module.exports = Review;
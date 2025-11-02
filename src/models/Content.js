const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class Content {
  constructor() {
    this.collection = getDB().collection('content');
  }

  /**
   * Crea nuevo contenido
   * @param {Object} contentData - Datos del contenido
   * @returns {Promise<Object>} Contenido creado
   */
  async create(contentData) {
    try {
      const content = {
        title: contentData.title,
        type: contentData.type, // 'movie', 'series', 'book'
        genre: contentData.genre,
        description: contentData.description,
        releaseDate: contentData.releaseDate ? new Date(contentData.releaseDate) : null,
        // Campos específicos
        author: contentData.author || null,
        pages: contentData.pages || null,
        isbn: contentData.isbn || null,
        director: contentData.director || null,
        duration: contentData.duration || null,
        seasons: contentData.seasons || null,
        // Imágenes
        coverImage: contentData.coverImage || '/assets/default-cover.png',
        backdropImage: contentData.backdropImage || null,
        // Metadatos
        averageRating: 0,
        ratingCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.collection.insertOne(content);
      return { _id: result.insertedId, ...content };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Encuentra contenido por ID
   * @param {string} id - ID del contenido
   * @returns {Promise<Object|null>} Contenido encontrado
   */
  async findById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  /**
   * Busca contenido por título
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} Lista de contenidos
   */
  async search(query) {
    return await this.collection.find({
      title: { $regex: query, $options: 'i' }
    }).toArray();
  }

  /**
   * Filtra contenido por tipo
   * @param {string} type - Tipo de contenido
   * @returns {Promise<Array>} Lista de contenidos
   */
  async findByType(type) {
    return await this.collection.find({ type }).toArray();
  }

  /**
   * Filtra contenido por género
   * @param {string} genre - Género a filtrar
   * @returns {Promise<Array>} Lista de contenidos
   */
  async findByGenre(genre) {
    return await this.collection.find({ genre: { $in: [genre] } }).toArray();
  }

  /**
   * Obtiene contenido popular (mejor rating)
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de contenidos populares
   */
  async getPopular(limit = 10) {
    return await this.collection.find()
      .sort({ averageRating: -1, ratingCount: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = Content;
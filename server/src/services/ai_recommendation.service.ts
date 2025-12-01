import ItemModel from '../models/item.model'
import { ItemType } from '../models/enums'

export const AIRecommendationService = {
  /**
   * Busca hasta `limit` items por tipo y género (coincidencia parcial, case-insensitive)
   */
  findByTypeAndGenre: async (type: ItemType | string, genre: string, limit = 3) => {
    if (!genre || !genre.trim()) return []
    const qGenre = genre.trim()
    const query: any = { itemType: type }
    // Build a fuzzy regex that allows missing/extra characters but preserves order
    // e.g. 'accion' -> /a.*c.*c.*i.*o.*n/i to tolerate typos like 'acion' or 'accin'
    const escapeForRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const compact = qGenre.replace(/\s+/g, '')
    const chars = compact.split('')
    const fuzzyPattern = chars.map(c => escapeForRegex(c)).join('.*')
    const fuzzyReg = new RegExp(fuzzyPattern, 'i')

    // Search genres, titles or descriptions for a fuzzy match.
    query['$or'] = [
      { 'data.genres': { $regex: fuzzyReg } },
      { title: { $regex: fuzzyReg } },
      { 'data.description': { $regex: fuzzyReg } }
    ]
    const items = await ItemModel.find(query).limit(limit).lean()
    return items || []
  }
}

export default AIRecommendationService

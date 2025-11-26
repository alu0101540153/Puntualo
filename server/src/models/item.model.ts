import mongoose, { Document, Schema } from 'mongoose'
import { ItemType } from './enums'

export interface IItem extends Document {
  itemType: ItemType
  title: string
  data?: {
    type?: string
    cover?: string
    description?: string
    author?: string
    genres?: string[]
  }
  // Identificador externo (por ejemplo, ID de Google Books) en nivel raíz
  externalId?: string
}

const itemSchema = new Schema({
  itemType: {
    type: String,
    enum: Object.values(ItemType),
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  data: {
    type: new Schema({
      type: {
        type: String,
        trim: true
      },
      cover: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      author: {
        type: String,
        trim: true
      },
      genres: {
        type: [String],
        default: []
      },
      // externalId moved to root level
    }, { _id: false }),
    default: {}
  }
  ,
  externalId: {
    type: String,
    trim: true,
    default: ''
  }
})

// Avoid OverwriteModelError when running tests that reload modules
const Item = (mongoose.models && (mongoose.models.Item as mongoose.Model<IItem>)) || mongoose.model<IItem>('Item', itemSchema)

export default Item

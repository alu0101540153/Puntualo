import mongoose, { Document, Schema } from 'mongoose'

// External enum for item types
export enum ItemType {
  MOVIE = 'movie',
  SERIES = 'series',
  BOOK = 'book'
}

export interface IItem extends Document {
  itemType: ItemType
  title: string
  data?: {
    type?: string
    cover?: string
    description?: string
    author?: string
    externalId?: string
  }
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
      externalId: {
        type: String,
        trim: true
      }
    }, { _id: false }),
    default: {}
  }
})

const Item = mongoose.model<IItem>('Item', itemSchema)

export default Item

import mongoose, { Document, Schema } from 'mongoose'
import { ItemType } from './enums'
import { RatedStatus } from './enums'

export interface IUser extends Document {
  handle: string
  name: string
  email: string
  password: string
  description: string
  follows: string[]
  ratedItems?: {
    itemId?: string
    itemData?: {
      externalId?: string
      title?: string
      author?: string
      cover?: string
      description?: string
    }
    itemType: ItemType
    score: number
    comment: string
    status: RatedStatus
    lastModified?: Date
  }[]
}

const userSchema = new Schema({
  handle: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  follows: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  ratedItems: {
    type: [{
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: false
    },
    // Optional embedded item data when no Item doc is created
    itemData: {
      type: new Schema({
        externalId: { type: String, trim: true, default: '' },
        title: { type: String, trim: true },
        author: { type: String, trim: true },
        cover: { type: String, trim: true },
        description: { type: String, trim: true },
      }, { _id: false }),
      default: {}
    },
    itemType: {
      type: String,
      enum: Object.values(ItemType),
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 10
    },
    comment: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(RatedStatus),
      default: RatedStatus.WATCHING
    },
    lastModified: {
      type: Date,
      default: Date.now
    }
    }],
    default: []
  }
})

const User = (mongoose.models && (mongoose.models.User as mongoose.Model<IUser>)) || mongoose.model<IUser>('User', userSchema)

// Export named UserModel for backward compatibility with existing imports
export const UserModel = User
export default User
import mongoose, { Document, Schema } from 'mongoose'
import { ItemType } from './enums'
import { RatedStatus } from './enums'

export interface IUser extends Document {
  handle: string
  name: string
  email: string
  password: string
  description: string
  isPrivate: boolean
  followers: string[]
  following: string[]
  ratedItems?: {
    itemId: string
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
  isPrivate: {
    type: Boolean,
    default: false
  },
  avatarBgColor: {
    type: String,
    default: '#9CA3AF',
    trim: true
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  items: {
    type: [{
      itemId: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
      },
      externalId: {
        type: String,
        trim: true
      },
      itemType: {
        type: String,
        enum: Object.values(ItemType)
      },
      title: {
        type: String,
        trim: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  ratedItems: {
    type: [{
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true
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
    }
    ,
    lastModified: {
      type: Date,
      default: Date.now
    }
    }],
    default: []
  }
})

// Avoid OverwriteModelError in test runs that reload modules
const User = (mongoose.models && (mongoose.models.User as mongoose.Model<IUser>)) || mongoose.model<IUser>('User', userSchema)

// Export named UserModel for backward compatibility with existing imports
export const UserModel = User
export default User

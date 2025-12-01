import mongoose, { Document, Schema } from 'mongoose'

export interface IFollowRequest extends Document {
  from: string
  to: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}

const followRequestSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Index para búsquedas rápidas
followRequestSchema.index({ from: 1, to: 1 })
followRequestSchema.index({ to: 1, status: 1 })

const FollowRequest = (mongoose.models && (mongoose.models.FollowRequest as mongoose.Model<IFollowRequest>)) 
  || mongoose.model<IFollowRequest>('FollowRequest', followRequestSchema)

export const FollowRequestModel = FollowRequest
export default FollowRequest

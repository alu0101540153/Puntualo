import mongoose, { Document, Schema } from 'mongoose'

export interface INotification extends Document {
  recipient: string
  sender?: string
  type: 'follow_request' | 'follow_accepted' | 'follow_rejected'
  message: string
  read: boolean
  relatedId?: string // ID de la solicitud de seguimiento relacionada
  createdAt: Date
}

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['follow_request', 'follow_accepted', 'follow_rejected'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    ref: 'FollowRequest'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Index para búsquedas rápidas
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 })

const Notification = (mongoose.models && (mongoose.models.Notification as mongoose.Model<INotification>)) 
  || mongoose.model<INotification>('Notification', notificationSchema)

export const NotificationModel = Notification
export default Notification

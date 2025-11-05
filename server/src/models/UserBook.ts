import mongoose, { Document, Schema } from 'mongoose'

// Interface for TypeScript
export interface IUserBook extends Document {
    userId: string       // ID of the user
    userName: string     // Name of the user
    bookId: string       // ID of the book (using googleBooks api)
    rating?: number      // personal rating (0-10)
    personalDescription?: string // personal comment/description
    title?: string
    authors?: string[]
    smallThumbnail?: string
    thumbnail?: string
}


// Mongoose schema
const userBookSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    bookId: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 10
    },
    personalDescription: {
        type: String,
        trim: true,
        default: ''
    },
    title: {
        type: String,
        trim: true,
        default: ''
    },
    authors: [{
        type: String,
        trim: true,
        default: ''
    }],
    smallThumbnail: {
        type: String,
        trim: true,
        default: ''
    },
    thumbnail: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true }) // keeps track of when the user added/updated this book

const UserBook = mongoose.model<IUserBook>('UserBook', userBookSchema)

export default UserBook

import mongoose, { Document, Schema} from 'mongoose'

export interface IUser extends Document{
    handle: string
    name: string
    email: string
    password: string
    description: string
    follows: string[]
}

// codigo exclusivo de mongoose
const userSchema= new Schema({
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
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password:{
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
    }]
})

const User= mongoose.model<IUser>('User', userSchema)

export default User
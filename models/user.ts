import { model, Schema, Model, Document } from 'mongoose';
import { Event } from './event'

export interface IUser {
    accessToken: string
    githubId: number
    deviceToken: string
    events: Event[]
}

const UserSchema = new Schema({
    accessToken: { type: String, required: true },
    githubId: { type: Number, required: true },
    deviceToken: { type: String, required: true },
    events: {
        type: [Object],
        default: [],
    }
})

export const User: Model<IUser & Document> = model('User', UserSchema);
import { model, Schema, Model, Document } from 'mongoose';
import {Event, EventType} from './event'

export interface IUser {
    accessToken: string
    githubId: number
    deviceTokens: string[]
    latestEvent?: Event,
    allowedTypes: EventType[]
}

const UserSchema = new Schema({
    accessToken: { type: String, required: true },
    githubId: { type: Number, required: true, index: true },
    deviceTokens: { type: [String], required: true, default: [] },
    latestEvent: { type: Object },
    allowedTypes: { type: [String], required: true, default: [] }
})

export const User: Model<IUser & Document> = model('User', UserSchema);
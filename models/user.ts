import { model, Schema, Model, Document } from 'mongoose';

export interface IUser {
    accessToken: string
    githubId: number
    deviceToken: string
}

const UserSchema = new Schema({
    accessToken: { type: String, required: true },
    githubId: { type: Number, required: true },
    deviceToken: { type: String, required: true }
})

export const User: Model<IUser & Document> = model('User', UserSchema);
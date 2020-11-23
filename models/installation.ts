import { model, Schema, Model, Document } from 'mongoose';

export interface IInstallation {
    installationId: number,
    githubId: number
}

const InstallationSchema = new Schema({
    installationId: { type: Number, required: true, index: true },
    githubId: { type: Number, required: true },
})

export const Installation: Model<IInstallation & Document> = model('Installation', InstallationSchema);
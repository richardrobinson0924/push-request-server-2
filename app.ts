import express from 'express'
import mongoose from 'mongoose'
import { router as webhookRouter } from "./routes/webhook";
import { router as userRouter } from "./routes/user";

require('dotenv').config()

const mongooseOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true
}

mongoose.connect(process.env.DB_URI, mongooseOptions).then(() => console.log('connected to database'))

export const app = express();

app.use(express.json());

app.use('/', (req, res) => res.sendStatus(200))

app.use('/receive-webhook', webhookRouter);
app.use('/users', userRouter)

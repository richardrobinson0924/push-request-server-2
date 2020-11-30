import express from 'express'
import mongoose from 'mongoose'
import {router as userRouter} from "./routes/user";
import {HTTPStatusCode} from "./lib/utils";
import {Webhooks} from "@octokit/webhooks";
import {configureWebhooks} from "./controllers/payload_parser";

const mongooseOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true
}

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.DB_URI!, mongooseOptions).then(() => console.log('connected to database'))
}

const webhooks = new Webhooks({
    secret: 'mysecret'
});

configureWebhooks(webhooks);

export const app = express();

app.set('port', process.env.PORT);

app.use(express.json());

app.get('/', (_, res) => res.sendStatus(HTTPStatusCode.OK))

app.use('/api/webhooks/github', webhooks.middleware);
app.use('/users', userRouter)

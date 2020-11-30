import express from 'express'
import {IUser, User} from "../models/user";
import {Installation} from "../models/installation";
import {APNS, SilentNotification} from "apns2";
import {HTTPStatusCode} from "../lib/utils";
import {EventPayloads, WebhookEvent} from "@octokit/webhooks";
import {PayloadParser} from '../controllers/payload_parser'
import * as mongoose from "mongoose";
const { Webhooks } = require("@octokit/webhooks");

const webhooks = new Webhooks({
    secret: "mysecret",
});

const payloadParser = new PayloadParser(webhooks);

export const router = express.Router();

const apnsClient = new APNS({
    team: process.env.APNS_ISS!,
    keyId: process.env.APNS_KID!,
    signingKey: process.env.APNS_AUTH_KEY!,
    host: process.env.APNS_SERVER!,
    defaultTopic: process.env.APNS_TOPIC!
})

webhooks.on('installation.created', async ({payload}: WebhookEvent<EventPayloads.WebhookPayloadInstallation>) => {
    await Installation.create({
        installationId: payload.installation.id,
        githubId: payload.installation.account.id
    })
})

async function getUserFromInstallationId(id: number): Promise<(IUser & mongoose.Document)> {
    const githubId: number | undefined = await Installation
        .findOne({ installationId: id })
        .map(installation => installation?.githubId);

    if (!githubId) {
        return Promise.reject(`Installation with id ${id} not found.`);
    }

    const user = await User.findOne({ githubId: githubId })
    if (!user) {
        return Promise.reject(`User with github id ${githubId} not found`);
    }

    return user;
}

router.post('/', async (req, res) => {
    const name = req.header('X-GitHub-Event');
    const id = req.header('X-GitHub-Delivery');

    if (!name || !id) {
        res.sendStatus(HTTPStatusCode.BAD_REQUEST);
        return;
    }

    const event = await payloadParser.getReceivedEvent(id, name, req.body);

    if (!event) {
        console.error(`Payload is undefined`);
        res.sendStatus(HTTPStatusCode.INTERNAL_SERVER_ERROR);
        return;
    }

    let user: IUser & mongoose.Document;
    try {
        user = await getUserFromInstallationId(req.body['installation']['id'])
    } catch (e) {
        console.error(e);
        res.sendStatus(HTTPStatusCode.NOT_FOUND);
        return;
    }

    if (!user.allowedTypes.includes(event.eventType)) {
        console.log(`event type ${event.eventType} excluded.`);
        res.sendStatus(HTTPStatusCode.NO_CONTENT);
        return;
    }

    user.latestEvent = event;
    await user.save();

    for (const deviceToken of user.deviceTokens) {
        const sn = new SilentNotification(deviceToken);

        try {
            console.log('Sending APNS notification');
            await apnsClient.send(sn);
        } catch (e) {
            console.error(`Error sending notification: ${JSON.stringify(e)}`);
            res.sendStatus(HTTPStatusCode.INTERNAL_SERVER_ERROR);
            return;
        }
    }

    res.sendStatus(HTTPStatusCode.OK);
})
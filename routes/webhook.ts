import express from 'express'
import {User} from "../models/user";
import {Installation} from "../models/installation";
import { APNS, SilentNotification } from "apns2";
import {apnsClient} from "../index";
import {parsePayload} from "../controllers/payload_parser";

export const router = express.Router();

const validEvents = [
    'installation',
    'issue',
    'pull_request',
    'pull_request_review'
]

router.post('/', async (req, res) => {
    console.log(`webhook data received: ${JSON.stringify(req.body)}\n\n`)

    if (!validEvents.some(e => Object.keys(req.body).includes(e))) {
        console.log('webhook event not valid')
        res.sendStatus(200)
        return
    }

    if (req.body['installation'] && req.body['installation']['account']) {
        if (req.body['action'] === 'created') {
            await Installation.create({
                installationId: req.body['installation']['id'],
                githubId: req.body['installation']['account']['id']
            })
        }

        res.sendStatus(200);
        return;
    }

    const githubId: number = await Installation
        .findOne({ installationId: req.body['installation']['id'] })
        .map(installation => installation.githubId)

    console.log(`github id is ${githubId}`)

    if (!githubId) {
        res.status(500).send(`Installation with id ${req.body['installation']['id']} not found.`)
    }

    const user = await User.findOne({ githubId: githubId })

    console.log(`device token is ${user.deviceToken}`)

    if (!user.deviceToken) {
        res.status(500).send(`User with github id ${githubId} not found`)
    }

    const event = await parsePayload(req.body, user.accessToken);
    if (!event) {
        res.status(500).send(`Payload is undefined`)
    }

    user.events.push(event);
    await user.save();

    const sn = new SilentNotification(user.deviceToken)

    try {
        console.log('Sending APNS notification')
        await apnsClient.send(sn)
        res.sendStatus(200);
    } catch (e) {
        const message = `Error sending notification: ${JSON.stringify(e)}`
        console.log(message)
        res.status(500).send(message)
    }
})
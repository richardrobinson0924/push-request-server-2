import express from 'express'
import {User} from "../models/user";
import {Installation} from "../models/installation";
import { APNS, SilentNotification } from "apns2";

export const router = express.Router();

const validEvents = [
    'installation',
    'issue',
    'pull_request'
]

const apnsClient = new APNS({
    team: process.env.APNS_ISS,
    keyId: process.env.APNS_KID,
    signingKey: process.env.APNS_AUTH_KEY,
    host: process.env.APNS_SERVER
})

router.post('/', async (req, res) => {
    console.log(`webhook data received: ${JSON.stringify(req.body)}\n\n`)

    if (!validEvents.some(e => Object.keys(req.body).includes(e))) {
        res.sendStatus(200)
        return
    }

    if (req.body['installation']) {
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

    if (!githubId) {
        res.status(500).send(`Installation with id ${req.body['installation']['id']} not found.`)
    }

    const deviceToken = await User
        .findOne({ githubId: githubId })
        .map(user => user.deviceToken)

    if (!deviceToken) {
        res.status(500).send(`User with github id ${githubId} not found`)
    }

    const sn = new SilentNotification(deviceToken)
    await apnsClient.send(sn)

    res.sendStatus(200);
})
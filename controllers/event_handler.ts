import {Event} from "../models/event";
import {APNS, SilentNotification} from "apns2";
import {IUser, User} from "../models/user";
import mongoose from "mongoose";
import {Installation} from "../models/installation";

const apnsClient = new APNS({
    team: process.env.APNS_ISS!,
    keyId: process.env.APNS_KID!,
    signingKey: process.env.APNS_AUTH_KEY!,
    host: process.env.APNS_SERVER!,
    defaultTopic: process.env.APNS_TOPIC!
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

export async function handleEvent(installationId: number, event: Event) {
    const user = await getUserFromInstallationId(installationId)

    if (!user.allowedTypes.includes(event.eventType)) {
        return Promise.reject(`event type ${event.eventType} excluded.`)
    }

    user.latestEvent = event;
    await user.save();

    for (const deviceToken of user.deviceTokens) {
        const sn = new SilentNotification(deviceToken);
        console.log('Sending APNS notification');
        await apnsClient.send(sn);
    }
}
import express from 'express'
import {User} from "../models/user";
import {EventType} from "../models/event";

export const router = express.Router();

/**
 * [POST] /
 * Creates a new `User` from the given data. If a `User` with the github id already exists, the
 * `User` is updated with the new device token, if any.
 *
 * The request body should be a JSON object of the form
 * ```
 * {
 *      'accessToken': string,
 *      'githubId': number,
 *      'deviceToken': string
 * }
 * ```
 */
router.post('/new', async (req, res) => {
    try {
        const { accessToken, githubId, deviceToken } = req.body

        const existingUser = await User.findOne({ githubId: githubId })
        if (existingUser) {
            console.log(`User with github id ${githubId} already exists`)

            if (!existingUser.deviceTokens.includes(deviceToken)) {
                console.log(`Adding device token ${deviceToken}`)

                existingUser.deviceTokens.push(deviceToken)
                await existingUser.save()
            }

            res.sendStatus(200);
        }

        const user = await User.create({
            accessToken: accessToken,
            githubId: githubId,
            deviceTokens: [deviceToken],
            latestEvent: null,
            allowedTypes: Object.values(EventType)
        })

        console.log(`User created: ${JSON.stringify(user)}`)
        res.sendStatus(201);
    } catch (e) {
        console.log(`Failed to create user: ${JSON.stringify(req.body)}`)
        res.sendStatus(500);
    }
})

/**
 * [GET] /latest-event
 * Fetches the latest `Event` for the authenticated `User`
 *
 * Headers:
 * 'Authorization' : <Access Token>
 *
 * Response:
 * A JSON object of the form
 * ```
 * {
 *      eventType: string
 *      repoName: string
 *      number: number
 *      title: string
 *      description: string
 *      avatarUrl: string
 *      timestamp: Date
 *      url: string
 * }
 * ```
 */
router.get('/latest-event', async (req, res) => {
    try {
        const token = req.headers.authorization
        console.log(`Finding user with token ${token}`)

        const event = await User
            .findOne({ accessToken: token })
            .map(user => user.latestEvent)

        res.json(event)
    } catch (e) {
        console.log('Failed to find user');
        res.sendStatus(500);
    }
})
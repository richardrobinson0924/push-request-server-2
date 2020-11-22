import express from 'express'
import {User} from "../models/user";

export const router = express.Router();

/**
 * [POST] /
 * Creates a new `User`, if no such `User` with the specified `accessToken` already exists
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
router.post('/', async (req, res) => {
    try {
        const existingUser = await User.findOne({ accessToken: req.body['accessToken'] })
        if (existingUser) {
            console.log(`User already exists`)
            res.sendStatus(200)
            return;
        }

        const user = await User.create(req.body)
        console.log(`User created: ${JSON.stringify(user)}`)

        res.sendStatus(201)
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
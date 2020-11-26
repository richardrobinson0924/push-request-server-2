import express from 'express'
import {User} from "../models/user";
import {EventType} from "../models/event";

export const router = express.Router();

/**
 * [GET] /:id/allowed_types
 * Gets a user's allowed notification types
 *
 * Parameters:
 * - id: the user's github id
 *
 * Response:
 * A JSON object of the form
 * ```
 * {
 *     allowedTypes: EventType[]
 * }
 * ```
 */
router.get('/:id/allowed_types', async (req, res) => {
    const githubId = parseInt(req.params['id']);

    const user = await User.findOne({ githubId: githubId })
    if (!user) {
        res.sendStatus(404);
    }

    res.json({ allowedTypes: user.allowedTypes })
})

/**
 * [POST] /:id/allowed_types
 * Sets a user's allowed notification types
 *
 * Parameters:
 * - id: the user's github id
 *
 * Request Body:
 * A JSON object of the form
 * ```
 * {
 *     allowedTypes: EventType[]
 * }
 * ```
 */
router.post('/:id/allowed_types', async (req, res) => {
    const githubId = parseInt(req.params['id']);

    try {
        await User.findOneAndUpdate(
        { githubId: githubId },
        { allowedTypes: req.body['allowedTypes'] }
        )

        res.sendStatus(200);
    } catch (e) {
        console.log('Failed to update user')
        res.sendStatus(500);
    }
})

/**
 * [POST] /
 * Creates a new `User` from the given data. If a `User` with the github id already exists, the
 * `User` is updated with the new device token, if any.
 *
 * The request body should be a JSON object of the form
 * ```
 * {
 *      'githubId': number,
 *      'deviceToken': string,
 *      'allowedTypes': EventType[]
 * }
 * ```
 */
router.post('/new', async (req, res) => {
    try {
        const { githubId, deviceToken, allowedTypes } = req.body

        const existingUser = await User.findOne({ githubId: githubId })
        if (existingUser) {
            console.log(`User with github id ${githubId} already exists`)

            if (!existingUser.deviceTokens.includes(deviceToken)) {
                console.log(`Adding device token ${deviceToken}`)

                existingUser.deviceTokens.push(deviceToken)
                await existingUser.save()
            }

            res.sendStatus(200);
            return;
        }

        const user = await User.create({
            githubId: githubId,
            deviceTokens: [deviceToken],
            allowedTypes: allowedTypes as EventType[]
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
 * 'Authorization' : <GitHub ID>
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
        const githubId = req.headers.authorization
        console.log(`Finding user with id ${githubId}`)

        const event = await User
            .findOne({ githubId: parseInt(githubId) })
            .map(user => user.latestEvent)

        res.json(event)
    } catch (e) {
        console.log('Failed to find user');
        res.sendStatus(500);
    }
})
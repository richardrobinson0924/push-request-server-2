import express from 'express'
import {User} from "../models/user";

export const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const user = await User.create(req.body)
        console.log(`User created: ${JSON.stringify(user)}`)

        res.sendStatus(200)
    } catch (e) {
        console.log(`Failed to create user: ${JSON.stringify(req.body)}`)
        res.sendStatus(500);
    }
})

router.get('/:accessToken', async (req, res) => {
    try {
        console.log(`Finding user with token ${req.params['accessToken']}`)
        const user = await User.findOne({ accessToken: req.params['accessToken'] })
        res.json(user)
    } catch (e) {
        console.log('Failed to find user');
        res.sendStatus(500);
    }
})
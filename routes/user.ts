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
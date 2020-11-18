import express from 'express'
import {User} from "../models/user";

export const router = express.Router();

router.post('/', async (req, res) => {
    const user = await User.create(req.body)
    console.log(`User created: ${JSON.stringify(user)}`)

    res.sendStatus(200)
})
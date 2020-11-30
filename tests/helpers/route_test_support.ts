import mongoose from "mongoose";
import {app} from '../../app'
import supertest from "supertest";
import {User} from "../../models/user";
import {Installation} from "../../models/installation";
import {configureWebhooks} from "../../controllers/payload_parser";

import apns2 from "apns2"
import {Webhooks} from "@octokit/webhooks";
jest.mock('apns2')

export const request = supertest(app);

export const webhooks = new Webhooks({secret: "0"});
configureWebhooks(webhooks);

const randDBName = () => Date.now()

beforeAll(async (done) => {
    const url = `mongodb://127.0.0.1/${randDBName()}`
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    done();
});

afterAll(async (done) => {
    await mongoose.disconnect();
    done();
})

afterEach(async (done) => {
    await User.deleteMany({})
    await Installation.deleteMany({})
    done();
})
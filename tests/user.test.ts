import mongoose from "mongoose";
import {app} from '../app'
import supertest from "supertest";
import {EventType} from "../models/event";
import {User} from "../models/user";
import {server} from "../index";

const request = supertest(app);

beforeAll(async () => {
    const url = `mongodb://127.0.0.1/test`
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
});

afterAll(async (done) => {
    await mongoose.disconnect();
    server.close();
    done();
})

afterEach(async () => {
    await User.deleteMany({})
})

test('gets allowed types', async (done) => {
    await User.create({
        githubId: 1,
        deviceTokens: [],
        allowedTypes: [EventType.issueOpened]
    })

    const res = await request.get('/users/1/allowed_types')
    expect(res.status).toBe(200)

    expect(res.body).toEqual({
        allowedTypes: [EventType.issueOpened]
    })

    done()
})

test('set allowed types', async (done) => {
    await User.create({
        githubId: 1,
        deviceTokens: [],
        allowedTypes: [EventType.issueOpened]
    })

    const res = await request.post('/users/1/allowed_types').send({
        allowedTypes: [EventType.prMerged]
    })

    expect(res.status).toBe(200)

    const user = await User.findOne({ githubId: 1 })

    expect(user.allowedTypes).toContain(EventType.prMerged)

    done()
})

test('creates user', async (done) => {
    const postData = {
        githubId: 1,
        deviceToken: 'token',
        allowedTypes: [EventType.issueOpened, EventType.prMerged]
    }

    const res = await request.post('/users/new').send(postData);
    expect(res.status).toBe(201);

    const user = await User.findOne({ githubId: 1 });

    expect(user.deviceTokens).toContain('token');
    expect(user.latestEvent).toBeFalsy();
    expect(user.allowedTypes).toContain(EventType.issueOpened)

    const postData2 = {
        githubId: 1,
        deviceToken: 'token2',
        allowedTypes: [EventType.issueOpened, EventType.prMerged]
    }

    const res2 = await request.post('/users/new').send(postData2);
    expect(res2.status).toBe(200);

    const user2 = await User.findOne({ githubId: 1 });
    expect(user2.deviceTokens).toContain('token2')

    done()
})
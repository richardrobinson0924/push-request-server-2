import { request } from "./helpers/route_test_support";
import {User} from "../models/user";
import {EventType} from "../models/event";

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

    expect(user!.allowedTypes).toContain(EventType.prMerged)

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

    expect(user!.deviceTokens).toContain('token');
    expect(user!.latestEvent).toBeFalsy();
    expect(user!.allowedTypes).toContain(EventType.issueOpened)

    const postData2 = {
        githubId: 1,
        deviceToken: 'token2',
        allowedTypes: [EventType.issueOpened, EventType.prMerged]
    }

    const res2 = await request.post('/users/new').send(postData2);
    expect(res2.status).toBe(200);

    const user2 = await User.findOne({ githubId: 1 });
    expect(user2!.deviceTokens).toContain('token2')

    done()
})
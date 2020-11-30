import {request} from "./helpers/route_test_support";
import {User} from "../models/user";
import {EventType} from "../models/event";
import {Installation} from "../models/installation";
import {HTTPStatusCode} from "../lib/utils";
import * as FakeData from "./helpers/fake_data"

test('webhook receive event valid', async (done) => {
    await User.create({
        githubId: 1,
        deviceTokens: [],
        allowedTypes: [EventType.prOpened]
    })

    await Installation.create({
        installationId: 123,
        githubId: 1
    })

    const response = await request.post('/receive-webhook')
        .set({
            'X-GitHub-Event': 'pull_request',
            'X-GitHub-Delivery': '1'
        })
        .send(FakeData.makePullRequestPayload('opened', false, 123))

    const user = await User.findOne({githubId: 1});
    expect(user!.latestEvent!.eventType).toEqual(EventType.prOpened);

    expect(response.status).toBe(HTTPStatusCode.OK);

    done()
})

test('invalid webhook event returns 204', async (done) => {
    await User.create({
        githubId: 1,
        deviceTokens: [],
        allowedTypes: [EventType.prOpened]
    })

    await Installation.create({
        installationId: 123,
        githubId: 1
    })

    const response = await request.post('/receive-webhook')
        .set({
            'X-GitHub-Event': 'issues',
            'X-GitHub-Delivery': '1'
        })
        .send(FakeData.makeIssuePayload('opened', 123))

    expect(response.status).toBe(HTTPStatusCode.NO_CONTENT);

    done()
})
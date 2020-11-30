import {webhooks} from "./helpers/route_test_support";
import {User} from "../models/user";
import {Event, EventType} from "../models/event";
import {Installation} from "../models/installation";
import * as FakeData from "./helpers/fake_data"

beforeEach(async (done) => {
    await User.create({
        githubId: 1,
        deviceTokens: [],
        allowedTypes: Object.values(EventType)
    })

    await Installation.create({
        installationId: 123,
        githubId: 1
    })

    done();
})

test('parses pull request reviews', async (done) => {
    // submitted, approved PR

    const payload = FakeData.makePullRequestReviewPayload('submitted', 'approved', 123);

    await webhooks.receive({id: '', name: 'pull_request_review', payload: payload});

    const expectedEvent: Event = {
        eventType: EventType.prReviewed,
        repoName: 'Codertocat/Hello-World',
        number: 2,
        title: 'Update the README with new information.',
        description: 'Approved #2',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
        timestamp: '2019-05-15T15:20:38Z',
        url: 'https://github.com/Codertocat/Hello-World/pull/2'
    }

    const user = await User.findOne({githubId: 1});

    expect(user!.latestEvent).toEqual(expectedEvent);

    done();
})

describe('parses pull requests', () => {
    test('pr opened payload', async (done) => {
        const payload = FakeData.makePullRequestPayload('opened', false, 123);

        await webhooks.receive({id: '', name: 'pull_request', payload: payload});

        const expectedEvent: Event = {
            eventType: EventType.prOpened,
            repoName: 'Codertocat/Hello-World',
            number: 2,
            title: 'Update the README with new information.',
            description: 'Opened #2',
            avatarUrl: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
            timestamp: '2019-05-15T15:20:33Z',
            url: 'https://github.com/Codertocat/Hello-World/pull/2'
        }

        const user = await User.findOne({githubId: 1});

        expect(user!.latestEvent).toEqual(expectedEvent);

        done();
    })

    test('pr closed payload', async (done) => {
        const payload = FakeData.makePullRequestPayload('closed', false, 123);

        await webhooks.receive({id: '', name: 'pull_request', payload: payload});

        const expectedEvent: Event = {
            eventType: EventType.prClosed,
            repoName: 'Codertocat/Hello-World',
            number: 2,
            title: 'Update the README with new information.',
            description: 'Closed #2',
            avatarUrl: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
            timestamp: '2019-05-15T15:20:33Z',
            url: 'https://github.com/Codertocat/Hello-World/pull/2'
        }

        const user = await User.findOne({githubId: 1});

        expect(user!.latestEvent).toEqual(expectedEvent);

        done();
    })

    test('pr merged payload', async (done) => {
        const payload = FakeData.makePullRequestPayload('closed', true, 123);

        await webhooks.receive({id: '', name: 'pull_request', payload: payload});

        const expectedEvent: Event = {
            eventType: EventType.prMerged,
            repoName: 'Codertocat/Hello-World',
            number: 2,
            title: 'Update the README with new information.',
            description: 'Merged #2 into master',
            avatarUrl: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
            timestamp: '2019-05-15T15:20:33Z',
            url: 'https://github.com/Codertocat/Hello-World/pull/2'
        }

        const user = await User.findOne({githubId: 1});

        expect(user!.latestEvent).toEqual(expectedEvent);

        done();
    })

    test('pr review requested payload', async (done) => {
        const payload = FakeData.makePullRequestPayload('review_requested', false, 123);

        await webhooks.receive({id: '', name: 'pull_request', payload: payload});

        const expectedEvent: Event = {
            eventType: EventType.prReviewRequested,
            repoName: 'Codertocat/Hello-World',
            number: 2,
            title: 'Update the README with new information.',
            description: '@Codertocat requested a review by @Codertocat2',
            avatarUrl: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
            timestamp: '2019-05-15T15:20:33Z',
            url: 'https://github.com/Codertocat/Hello-World/pull/2'
        }

        const user = await User.findOne({githubId: 1});

        expect(user!.latestEvent).toEqual(expectedEvent);

        done();
    })
})

describe('parses issues', () => {
    test('issue opened payload', async (done) => {
        const payload = FakeData.makeIssuePayload('opened', 123);

        await webhooks.receive({id: '', name: 'issues', payload: payload})

        const expectedEvent: Event = {
            eventType: EventType.issueOpened,
            repoName: 'Codertocat/Hello-World',
            number: 1,
            title: 'Spelling error in the README file',
            description: 'Opened #1',
            avatarUrl: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
            timestamp: '2019-05-15T15:20:18Z',
            url: 'https://github.com/Codertocat/Hello-World/issues/1'
        }

        const user = await User.findOne({githubId: 1});

        expect(user!.latestEvent).toEqual(expectedEvent);

        done();
    });

    test('issue closed payload', async (done) => {
        const payload2 = FakeData.makeIssuePayload('closed', 123);

        await webhooks.receive({id: '', name: 'issues', payload: payload2})

        const expectedEvent2: Event = {
            eventType: EventType.issueClosed,
            repoName: 'Codertocat/Hello-World',
            number: 1,
            title: 'Spelling error in the README file',
            description: 'Closed #1',
            avatarUrl: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
            timestamp: '2019-05-15T15:20:18Z',
            url: 'https://github.com/Codertocat/Hello-World/issues/1'
        }

        const user2 = await User.findOne({githubId: 1});

        expect(user2!.latestEvent).toEqual(expectedEvent2);

        done();
    });

    test('issue assigned payload', async (done) => {
        const payload3 = FakeData.makeIssuePayload('assigned', 123);

        await webhooks.receive({id: '', name: 'issues', payload: payload3})

        const expectedEvent3: Event = {
            eventType: EventType.issueAssigned,
            repoName: 'Codertocat/Hello-World',
            number: 1,
            title: 'Spelling error in the README file',
            description: 'Assigned #1 to @Codertocat2',
            avatarUrl: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
            timestamp: '2019-05-15T15:20:18Z',
            url: 'https://github.com/Codertocat/Hello-World/issues/1'
        }

        const user3 = await User.findOne({githubId: 1});

        expect(user3!.latestEvent).toEqual(expectedEvent3);

        done();
    });
})
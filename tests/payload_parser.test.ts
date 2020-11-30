import * as FakeData from './helpers/fake_data'
import {PayloadParser} from "../controllers/payload_parser";
import {Event, EventType} from "../models/event";
import {Webhooks} from "@octokit/webhooks";

const webhooks = new Webhooks({secret: "0"});
const parser = new PayloadParser(webhooks);

test('parses issues', async (done) => {
    const payload = FakeData.makeIssuePayload('opened', 0)
    const actualEvent = await parser.getReceivedEvent('', 'issues', payload);

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

    expect(actualEvent).toEqual(expectedEvent)

    const payload2 = FakeData.makeIssuePayload('closed', 0)
    const actualEvent2 = await parser.getReceivedEvent('', 'issues', payload2);

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

    expect(actualEvent2).toEqual(expectedEvent2)

    const payload3 = FakeData.makeIssuePayload('assigned', 0)
    await webhooks.receive({id: '', name: 'issues', payload: payload3})
    const actualEvent3 = await parser.getReceivedEvent('', 'issues', payload3);

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

    expect(actualEvent3).toEqual(expectedEvent3)

    done()
})

test('parses pull request reviews', async (done) => {
    const payload = FakeData.makePullRequestReviewPayload('submitted', 'approved', 0);
    const actualEvent = await parser.getReceivedEvent('', 'pull_request_review', payload);

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

    expect(actualEvent).toEqual(expectedEvent);

    done();
})

test('parses pull requests', async (done) => {
    const payload = FakeData.makePullRequestPayload('opened', false, 0);
    const actualEvent = await parser.getReceivedEvent('', 'pull_request', payload);

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

    expect(actualEvent).toEqual(expectedEvent)

    const payload2 = FakeData.makePullRequestPayload('closed', false, 0);
    const actualEvent2 = await parser.getReceivedEvent('', 'pull_request', payload2);

    const expectedEvent2: Event = {
        eventType: EventType.prClosed,
        repoName: 'Codertocat/Hello-World',
        number: 2,
        title: 'Update the README with new information.',
        description: 'Closed #2',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
        timestamp: '2019-05-15T15:20:33Z',
        url: 'https://github.com/Codertocat/Hello-World/pull/2'
    }

    expect(actualEvent2).toEqual(expectedEvent2)

    const payload3 = FakeData.makePullRequestPayload('closed', true, 0);
    const actualEvent3 = await parser.getReceivedEvent('', 'pull_request', payload3);

    const expectedEvent3: Event = {
        eventType: EventType.prMerged,
        repoName: 'Codertocat/Hello-World',
        number: 2,
        title: 'Update the README with new information.',
        description: 'Merged #2 into master',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
        timestamp: '2019-05-15T15:20:33Z',
        url: 'https://github.com/Codertocat/Hello-World/pull/2'
    }

    expect(actualEvent3).toEqual(expectedEvent3)

    const payload4 = FakeData.makePullRequestPayload('review_requested', false, 0);
    const actualEvent4 = await parser.getReceivedEvent('', 'pull_request', payload4);

    const expectedEvent4: Event = {
        eventType: EventType.prReviewRequested,
        repoName: 'Codertocat/Hello-World',
        number: 2,
        title: 'Update the README with new information.',
        description: '@Codertocat requested a review by @Codertocat2',
        avatarUrl: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
        timestamp: '2019-05-15T15:20:33Z',
        url: 'https://github.com/Codertocat/Hello-World/pull/2'
    }

    expect(actualEvent4).toEqual(expectedEvent4)

    done();
})

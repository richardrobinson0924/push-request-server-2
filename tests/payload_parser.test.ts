import * as FakeData from './helpers/fake_data'
import {parsePayload} from "../controllers/payload_parser";
import {Event, EventCategory, EventType} from "../models/event";

test('parses issues', () => {
    const payload = FakeData.makeIssuePayload('opened')
    const actualEvent = parsePayload(payload, EventCategory.issues);
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

    const payload2 = FakeData.makeIssuePayload('closed')
    const actualEvent2 = parsePayload(payload2, EventCategory.issues);
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

    const payload3 = FakeData.makeIssuePayload('assigned')
    const actualEvent3 = parsePayload(payload3, EventCategory.issues);
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
})

test('parses pull request reviews', () => {
    const payload = FakeData.makePullRequestReviewPayload('submitted', 'approved');
    const actualEvent = parsePayload(payload, EventCategory.pullRequestReview);
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
})

test('parses pull requests', () => {
    const payload = FakeData.makePullRequestPayload('opened', false);
    const actualEvent = parsePayload(payload, EventCategory.pullRequest);
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

    const payload2 = FakeData.makePullRequestPayload('closed', false);
    const actualEvent2 = parsePayload(payload2, EventCategory.pullRequest);
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

    const payload3 = FakeData.makePullRequestPayload('closed', true);
    const actualEvent3 = parsePayload(payload3, EventCategory.pullRequest);
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

    const payload4 = FakeData.makePullRequestPayload('review_requested', false);
    const actualEvent4 = parsePayload(payload4, EventCategory.pullRequest);
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
})

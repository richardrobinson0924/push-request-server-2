import {Event, EventCategory, EventType} from "../models/event";

function parseIssue(
    action: string,
    sender: object,
    issue: object,
    assignee: object,
    repo: object
): Event | undefined {
    const avatarUrl = sender['avatar_url'];
    const repoName = repo['full_name'];

    const url = issue['html_url'];
    const number = issue['number'];
    const title = issue['title'];
    const timestamp = issue['updated_at']

    let eventType: EventType
    let description: string

    switch (action) {
        case 'opened':
            eventType = EventType.issueOpened;
            description = `Opened #${number}`;
            break;

        case 'closed':
            eventType = EventType.issueClosed;
            description = `Closed #${number}`;
            break;

        case 'assigned':
            eventType = EventType.issueAssigned;
            const assigneeName = assignee['login'];
            description = `Assigned #${number} to @${assigneeName}`;
            break;

        default:
            return undefined;
    }

    return {
        eventType: eventType,
        repoName: repoName,
        number: number,
        title: title,
        description: description,
        avatarUrl: avatarUrl,
        timestamp: timestamp,
        url: url
    }
}

function parsePullRequestReview(
    action: string,
    sender: object,
    pr: object,
    review: object,
    repo: object
): Event | undefined {
    const avatarUrl = sender['avatar_url'];
    const repoName = repo['full_name'];

    const reviewer = sender['login'];
    const eventType = EventType.prReviewed

    if (action !== 'submitted') {
        return undefined;
    }

    const url = pr['html_url'];
    const title = pr['title'];
    const number = pr['number'];
    const timestamp = pr['updated_at']

    let description;

    switch (review['state']) {
        case 'CHANGES_REQUESTED':
            description = `@${reviewer} requested changes.`
            break;

        case 'APPROVED':
            description = `@${reviewer} approved this pull request`;
            break;

        case 'DISMISSED':
            description = `@${reviewer} dismissed this pull request`;
            break;

        case 'COMMENTED':
            description = `@${reviewer} commented on this pull request`;
            break;

        default:
            return undefined;
    }

    return {
        eventType: eventType,
        repoName: repoName,
        number: number,
        title: title,
        description: description,
        avatarUrl: avatarUrl,
        timestamp: timestamp,
        url: url
    }
}

function parsePullRequest(
    action: string,
    sender: object,
    pr: object,
    repo: object,
    requestedReviewer: object,
): Event | undefined {
    const avatarUrl = sender['avatar_url'];
    const repoName = repo['full_name'];

    const url = pr['html_url'];
    const title = pr['title'];
    const number = pr['number'];
    const timestamp = pr['updated_at']

    let eventType;
    let description;

    switch (action) {
        case 'opened':
            eventType = EventType.prOpened;
            description = `Opened #${number}`
            break;

        case 'closed':
            const isMerged = pr['merged'] === true;
            eventType = isMerged ? EventType.prMerged : EventType.prClosed;
            description = isMerged
                ? `Merged #${number} into ${pr['base']['ref']}`
                : `Closed #${number}`;
            break;

        case 'review_requested':
            eventType = EventType.prReviewRequested;

            const requester = sender['login'];
            const requestee = requestedReviewer['login'];

            description = `@${requester} requested a review by @${requestee}`;
            break;

        default:
            return undefined;
    }

    return {
        eventType: eventType,
        repoName: repoName,
        number: number,
        title: title,
        description: description,
        avatarUrl: avatarUrl,
        timestamp: timestamp,
        url: url
    }
}

export function parsePayload(payload: object, category: EventCategory): Event | undefined {
    console.log(`Parsing payload with category ${category}`)

    switch (category) {
        case EventCategory.pullRequestReview:
            return parsePullRequestReview(
                payload['action'],
                payload['sender'],
                payload['pull_request'],
                payload['review'],
                payload['repository']
            )

        case EventCategory.pullRequest:
            return parsePullRequest(
                payload['action'],
                payload['sender'],
                payload['pull_request'],
                payload['repository'],
                payload['requested_reviewer'],
            )

        case EventCategory.issues:
            return parseIssue(
                payload['action'],
                payload['sender'],
                payload['issue'],
                payload['assignee'],
                payload['repository']
            )

        default:
            return undefined;
    }
}
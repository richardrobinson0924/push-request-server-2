import axios from 'axios'
import { Event } from "../models/event";

export enum EventType {
    issueOpened,
    issueClosed,
    issueAssigned,
    prOpened,
    prClosed,
    prMerged,
    prReviewRequested,
    prReviewed
}

function parseIssue(
    action: string,
    sender: object,
    issue: object,
    assignee: object,
    repo: object
): Event | undefined {
    const avatarUrl = sender['avatar_url'];
    const repoName = repo['full_name'];

    let eventType: EventType
    let description: string

    switch (action) {
        case 'opened':
            eventType = EventType.issueOpened;
            description = `@${sender['login']} opened this issue`;
            break;

        case 'closed':
            eventType = EventType.issueClosed;
            description = `@${sender['login']} closed this issue`;
            break;

        case 'assigned':
            eventType = EventType.issueAssigned;
            const assigner = sender['login'];
            const assigneeName = assignee['login'];
            description = `@${assigner} assigned this issue to @${assigneeName}`;
            break;

        default:
            return undefined;
    }

    const url = issue['html_url'];
    const number = issue['number'];
    const title = issue['title'];
    const timestamp = new Date(issue['updated_at'])

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
    const timestamp = new Date(pr['updated_at'])

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
            description = `@${reviewer} commented on this pull reuqest`;
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

async function parsePullRequest(
    action: string,
    sender: object,
    pr: object,
    repo: object,
    requestedReviewer: object,
    accessToken: string
): Promise<Event | undefined> {
    const avatarUrl = sender['avatar_url'];
    const repoName = repo['full_name'];

    const url = pr['html_url'];
    const title = pr['title'];
    const number = pr['number'];
    const timestamp = new Date(pr['updated_at'])

    let eventType;
    let description;

    switch (action) {
        case 'opened':
            eventType = EventType.prOpened;
            description = `@${sender['login']} opened this pull request`
            break;

        case 'closed':
            const isMerged = pr['merged'] === true;
            eventType = isMerged ? EventType.prMerged : EventType.prClosed;

            if (isMerged) {
                description = `@${pr['merged_by']['login']} merged ${pr['head']['ref']} into ${pr['base']['ref']}`;
            } else {
                const issue = await axios.get(pr['_links']['issue']['href'], {
                    headers: {
                        'Authorization': `token ${accessToken}`
                    }
                })

                const closedBy = issue.data['closed_by']['login']
                description = `@${closedBy} closed this pull request`
            }
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

export async function parsePayload(payload: object, accessToken: string): Promise<Event | undefined> {
    console.log('Parsing payload')

    if (payload['pull_request_review']) {
        console.log('Parsing pull request review')
        return parsePullRequestReview(
            payload['action'],
            payload['sender'],
            payload['pull_request'],
            payload['review'],
            payload['repository']
        )
    }

    if (payload['pull_request']) {
        console.log('Parsing pull request')
        return await parsePullRequest(
            payload['action'],
            payload['sender'],
            payload['pull_request'],
            payload['repository'],
            payload['requested_reviewer'],
            accessToken
        )
    }

    if (payload['issue']) {
        console.log('Parsing issue')
        return parseIssue(
            payload['action'],
            payload['sender'],
            payload['issue'],
            payload['assignee'],
            payload['repository']
        )
    }

    return undefined;
}
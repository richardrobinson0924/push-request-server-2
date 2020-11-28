import {Event, EventCategory, EventType} from "../models/event";
import {GithubUser, Issue, Payload, PullRequest, PullRequestReview, Repository} from "../models/payload";

function parseIssue(
    action: string,
    sender: GithubUser,
    issue: Issue,
    repo: Repository
): Event | undefined {
    let eventType: EventType
    let description: string

    switch (action) {
        case 'opened':
            eventType = EventType.issueOpened;
            description = `Opened #${issue.number}`;
            break;

        case 'closed':
            eventType = EventType.issueClosed;
            description = `Closed #${issue.number}`;
            break;

        case 'assigned':
            eventType = EventType.issueAssigned;
            description = `Assigned #${issue.number} to @${issue.assignee.login}`;
            break;

        default:
            return undefined;
    }

    return {
        eventType: eventType,
        repoName: repo.full_name,
        number: issue.number,
        title: issue.title,
        description: description,
        avatarUrl: sender.avatar_url,
        timestamp: issue.updated_at,
        url: issue.html_url
    }
}

function parsePullRequestReview(
    action: string,
    sender: GithubUser,
    pr: PullRequest,
    review: PullRequestReview,
    repo: Repository
): Event | undefined {
    const eventType = EventType.prReviewed

    if (action !== 'submitted') {
        return undefined;
    }

    let description;

    switch (review['state']) {
        case 'changes_requested':
            description = `Requested changes on #${pr.number}`
            break;

        case 'approved':
            description = `Approved #${pr.number}`;
            break;

        case 'dismissed':
            description = `Dismissed #${pr.number}`;
            break;

        case 'commented':
            description = `Commented on #${pr.number}`;
            break;

        default:
            return undefined;
    }

    return {
        eventType: eventType,
        repoName: repo.full_name,
        number: pr.number,
        title: pr.title,
        description: description,
        avatarUrl: sender.avatar_url,
        timestamp: pr.updated_at,
        url: pr.html_url
    }
}

function parsePullRequest(
    action: string,
    sender: GithubUser,
    pr: PullRequest,
    repo: Repository,
    requestedReviewer: GithubUser,
): Event | undefined {
    let eventType;
    let description;

    switch (action) {
        case 'opened':
            eventType = EventType.prOpened;
            description = `Opened #${pr.number}`
            break;

        case 'closed':
            eventType = pr.merged ? EventType.prMerged : EventType.prClosed;
            description = pr.merged
                ? `Merged #${pr.number} into ${pr.base.ref}`
                : `Closed #${pr.number}`;
            break;

        case 'review_requested':
            eventType = EventType.prReviewRequested;

            const requester = sender.login;
            const requestee = requestedReviewer.login;

            description = `@${requester} requested a review by @${requestee}`;
            break;

        default:
            return undefined;
    }

    return {
        eventType: eventType,
        repoName: repo.full_name,
        number: pr.number,
        title: pr.title,
        description: description,
        avatarUrl: sender.avatar_url,
        timestamp: pr.updated_at,
        url: pr.html_url
    }
}

export function parsePayload(payload: Payload, category: EventCategory): Event | undefined {
    console.log(`Parsing payload with category ${category}`)

    switch (category) {
        case EventCategory.pullRequestReview:
            return parsePullRequestReview(
                payload.action,
                payload.sender,
                payload.pull_request!,
                payload.review!,
                payload.repository!
            )

        case EventCategory.pullRequest:
            return parsePullRequest(
                payload.action,
                payload.sender,
                payload.pull_request!,
                payload.repository!,
                payload.requested_reviewer!,
            )

        case EventCategory.issues:
            return parseIssue(
                payload.action,
                payload.sender,
                payload.issue!,
                payload.repository!
            )

        default:
            return undefined;
    }
}
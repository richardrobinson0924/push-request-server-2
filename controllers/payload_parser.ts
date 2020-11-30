import {EventPayloads, WebhookEvent, Webhooks} from "@octokit/webhooks";
import {Event, EventType} from "../models/event";
import {handleEvent} from "./event_handler";
import {Installation} from "../models/installation";

async function parseIssuesAssignedPayload({payload}: WebhookEvent<EventPayloads.WebhookPayloadIssues>) {
    const event: Event = {
        eventType: EventType.issueAssigned,
        repoName: payload.repository.full_name,
        number: payload.issue.number,
        title: payload.issue.title,
        description: `Assigned #${payload.issue.number} to @${payload.issue.assignee!.login}`,
        url: payload.issue.html_url,
        timestamp: payload.issue.updated_at,
        avatarUrl: payload.sender.avatar_url
    }

    await handleEvent(payload.installation!.id, event);
}

async function parseIssueOpenedClosedPayload({payload}: WebhookEvent<EventPayloads.WebhookPayloadIssues>) {
    const event: Event = {
        eventType: payload.action === 'opened' ? EventType.issueOpened : EventType.issueClosed,
        repoName: payload.repository.full_name,
        number: payload.issue.number,
        title: payload.issue.title,
        description: payload.action === 'opened'
            ? `Opened #${payload.issue.number}`
            : `Closed #${payload.issue.number}`,
        url: payload.issue.html_url,
        timestamp: payload.issue.updated_at,
        avatarUrl: payload.sender.avatar_url
    }

    await handleEvent(payload.installation!.id, event);
}

async function parsePRReview({payload}: WebhookEvent<EventPayloads.WebhookPayloadPullRequestReview>) {
    let description;

    switch (payload.review.state) {
        case 'changes_requested':
            description = `Requested changes on #${payload.pull_request.number}`
            break;

        case 'approved':
            description = `Approved #${payload.pull_request.number}`;
            break;

        case 'dismissed':
            description = `Dismissed #${payload.pull_request.number}`;
            break;

        case 'commented':
            description = `Commented on #${payload.pull_request.number}`;
            break;

        default:
            return undefined;
    }

    const event: Event = {
        eventType: EventType.prReviewed,
        repoName: payload.repository.full_name,
        number: payload.pull_request.number,
        title: payload.pull_request.title,
        description: description,
        avatarUrl: payload.sender.avatar_url,
        timestamp: payload.pull_request.updated_at,
        url: payload.pull_request.html_url
    }

    await handleEvent(payload.installation!.id, event);
}

async function parsePROpen({payload}: WebhookEvent<EventPayloads.WebhookPayloadPullRequest>) {
    const event: Event = {
        eventType: EventType.prOpened,
        repoName: payload.repository.full_name,
        number: payload.pull_request.number,
        title: payload.pull_request.title,
        description: `Opened #${payload.pull_request.number}`,
        avatarUrl: payload.sender.avatar_url,
        timestamp: payload.pull_request.updated_at,
        url: payload.pull_request.html_url
    }

    await handleEvent(payload.installation!.id, event);
}

async function parsePRReviewRequest({payload}: WebhookEvent<EventPayloads.WebhookPayloadPullRequest>) {
    const event: Event = {
        eventType: EventType.prReviewRequested,
        repoName: payload.repository.full_name,
        number: payload.pull_request.number,
        title: payload.pull_request.title,
        description: `@${payload.sender.login} requested a review by @${payload.pull_request.requested_reviewers[0].login}`,
        avatarUrl: payload.sender.avatar_url,
        timestamp: payload.pull_request.updated_at,
        url: payload.pull_request.html_url
    }

    await handleEvent(payload.installation!.id, event);
}

async function parsePRMergeClose({payload}: WebhookEvent<EventPayloads.WebhookPayloadPullRequest>) {
    const event: Event = {
        eventType: payload.pull_request.merged ? EventType.prMerged : EventType.prClosed,
        repoName: payload.repository.full_name,
        number: payload.pull_request.number,
        title: payload.pull_request.title,
        description: payload.pull_request.merged
            ? `Merged #${payload.pull_request.number} into ${payload.pull_request.base.ref}`
            : `Closed #${payload.pull_request.number}`,
        avatarUrl: payload.sender.avatar_url,
        timestamp: payload.pull_request.updated_at,
        url: payload.pull_request.html_url
    }

    await handleEvent(payload.installation!.id, event);
}

async function createInstallation({payload}: WebhookEvent<EventPayloads.WebhookPayloadInstallation>) {
    await Installation.create({
        installationId: payload.installation.id,
        githubId: payload.installation.account.id
    })
}

export function configureWebhooks(webhooks: Webhooks) {
    webhooks.on('issues.assigned', parseIssuesAssignedPayload);
    webhooks.on(['issues.opened', 'issues.closed'], parseIssueOpenedClosedPayload);
    webhooks.on('pull_request_review.submitted', parsePRReview);
    webhooks.on(['pull_request.merged', 'pull_request.closed'], parsePRMergeClose);
    webhooks.on('pull_request.opened', parsePROpen)
    webhooks.on('pull_request.review_requested', parsePRReviewRequest);

    webhooks.on('installation.created', createInstallation);

    webhooks.onError(console.error);
}
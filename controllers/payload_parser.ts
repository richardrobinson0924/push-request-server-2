import {EventPayloads, WebhookEvent, Webhooks} from "@octokit/webhooks";
import {Event, EventType} from "../models/event";

export class PayloadParser {
    private _parsedEvent: Event | undefined
    private _webhooks: Webhooks

    constructor(webhooks: Webhooks) {
        this._webhooks = webhooks;

        this._webhooks.on('issues.assigned', this.parseIssuesAssignedPayload);
        this._webhooks.on(['issues.opened', 'issues.closed'], this.parseIssueOpenedClosedPayload);
        this._webhooks.on('pull_request_review.submitted', this.parsePRReview);
        this._webhooks.on(['pull_request.merged', 'pull_request.closed'], this.parsePRMergeClose);
        this._webhooks.on('pull_request.opened', this.parsePROpen)
        this._webhooks.on('pull_request.review_requested', this.parsePRReviewRequest);
    }

    getReceivedEvent = async (id: string, name: string, payload: object): Promise<Event | undefined> => {
        this._parsedEvent = undefined;

        await this._webhooks.receive({
            id: id,
            name: name,
            payload: payload
        })

        return this._parsedEvent;
    };

    parseIssuesAssignedPayload = ({payload}: WebhookEvent<EventPayloads.WebhookPayloadIssues>) => {
        this._parsedEvent = {
            eventType: EventType.issueAssigned,
            repoName: payload.repository.full_name,
            number: payload.issue.number,
            title: payload.issue.title,
            description: `Assigned #${payload.issue.number} to @${payload.issue.assignee!.login}`,
            url: payload.issue.html_url,
            timestamp: payload.issue.updated_at,
            avatarUrl: payload.sender.avatar_url
        }
    };

    parseIssueOpenedClosedPayload = ({payload}: WebhookEvent<EventPayloads.WebhookPayloadIssues>) => {
        this._parsedEvent = {
            eventType: payload.action === 'opened' ? EventType.issueOpened : EventType.issueClosed,
            repoName: payload.repository.full_name,
            number: payload.issue.number,
            title: payload.issue.title,
            description: payload.action === 'opened' ? `Opened #${payload.issue.number}` : `Closed #${payload.issue.number}`,
            url: payload.issue.html_url,
            timestamp: payload.issue.updated_at,
            avatarUrl: payload.sender.avatar_url
        }
    };

    parsePRReview = ({payload}: WebhookEvent<EventPayloads.WebhookPayloadPullRequestReview>) => {
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

        this._parsedEvent = {
            eventType: EventType.prReviewed,
            repoName: payload.repository.full_name,
            number: payload.pull_request.number,
            title: payload.pull_request.title,
            description: description,
            avatarUrl: payload.sender.avatar_url,
            timestamp: payload.pull_request.updated_at,
            url: payload.pull_request.html_url
        }
    };

    parsePROpen = ({payload}: WebhookEvent<EventPayloads.WebhookPayloadPullRequest>) => {
        this._parsedEvent = {
            eventType: EventType.prOpened,
            repoName: payload.repository.full_name,
            number: payload.pull_request.number,
            title: payload.pull_request.title,
            description: `Opened #${payload.pull_request.number}`,
            avatarUrl: payload.sender.avatar_url,
            timestamp: payload.pull_request.updated_at,
            url: payload.pull_request.html_url
        }
    };

    parsePRReviewRequest = ({payload}: WebhookEvent<EventPayloads.WebhookPayloadPullRequest>) => {
        this._parsedEvent = {
            eventType: EventType.prReviewRequested,
            repoName: payload.repository.full_name,
            number: payload.pull_request.number,
            title: payload.pull_request.title,
            description: `@${payload.sender.login} requested a review by @${payload.pull_request.requested_reviewers[0].login}`,
            avatarUrl: payload.sender.avatar_url,
            timestamp: payload.pull_request.updated_at,
            url: payload.pull_request.html_url
        }
    };

    parsePRMergeClose = ({payload}: WebhookEvent<EventPayloads.WebhookPayloadPullRequest>) => {
        this._parsedEvent = {
            eventType: payload.pull_request.merged ? EventType.prMerged : EventType.prClosed,
            repoName: payload.repository.full_name,
            number: payload.pull_request.number,
            title: payload.pull_request.title,
            description: payload.pull_request.merged ? `Merged #${payload.pull_request.number} into ${payload.pull_request.base.ref}` : `Closed #${payload.pull_request.number}`,
            avatarUrl: payload.sender.avatar_url,
            timestamp: payload.pull_request.updated_at,
            url: payload.pull_request.html_url
        }
    };
}
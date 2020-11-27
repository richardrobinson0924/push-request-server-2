export enum EventType {
    issueOpened = 'issueOpened',
    issueClosed = 'issueClosed',
    issueAssigned = 'issueAssigned',
    prOpened = 'prOpened',
    prClosed = 'prClosed',
    prMerged = 'prMerged',
    prReviewRequested = 'prReviewRequested',
    prReviewed = 'prReviewed'
}

export enum EventCategory {
    installation = 'installation',
    issues = 'issues',
    pullRequest = 'pull_request',
    pullRequestReview = 'pull_request_review'
}

export interface Event {
    eventType: EventType
    repoName: string
    number: number
    title: string
    description: string
    avatarUrl: string
    timestamp: string
    url: string
}
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
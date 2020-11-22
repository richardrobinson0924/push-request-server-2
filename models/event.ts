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
export interface Event {
    eventType: EventType
    repoName: string
    number: number
    title: string
    description: string
    avatarUrl: string
    timestamp: Date
    url: string
}
import {EventType} from "../controllers/payload_parser";

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
export interface GithubUser {
    avatar_url: string
    login: string
    [others: string]: any
}

export interface Issue {
    html_url: string
    number: number
    title: string
    updated_at: string
    assignee: GithubUser
    [others: string]: any
}

export interface Repository {
    full_name: string
    [others: string]: any
}

export interface Branch {
    ref: string
    [others: string]: any
}

export interface PullRequest {
    html_url: string
    title: string
    number: number
    updated_at: string
    merged?: boolean
    base: Branch
    [others: string]: any
}

export interface PullRequestReview {
    state: string
    [others: string]: any
}

export interface Payload {
    action: string
    sender: GithubUser
    pull_request?: PullRequest
    review?: PullRequestReview
    repository?: Repository
    requested_reviewer?: GithubUser
    issue?: Issue
    [others: string]: any
}
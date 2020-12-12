package models

import "time"

type EventType string

const (
	IssueOpened       EventType = "issueOpened"
	IssueClosed       EventType = "issueClosed"
	IssueAssigned     EventType = "issueAssigned"
	PrOpened          EventType = "prOpened"
	PrClosed          EventType = "prClosed"
	PrMerged          EventType = "prMerged"
	PrReviewRequested EventType = "prReviewRequested"
	PrReviewed        EventType = "prReviewed"
)

type Event struct {
	EventType      EventType `json:"event_type"`
	RepoName       string    `json:"repo_name"`
	RepoId         int64     `json:"repo_id"`
	Number         int       `json:"number"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	AvatarUrl      string    `json:"avatar_url"`
	Timestamp      time.Time `json:"timestamp"`
	Url            string    `json:"url"`
	InstallationId int64     `json:"installation_id"`
}

func NewEvent(
	eventType EventType, repoName string, repoId int64, number int, title string, description string,
	avatarUrl string, timestamp time.Time, url string, installationId int64,
) *Event {
	return &Event{
		EventType:      eventType,
		RepoName:       repoName,
		RepoId:         repoId,
		Number:         number,
		Title:          title,
		Description:    description,
		AvatarUrl:      avatarUrl,
		Timestamp:      timestamp,
		Url:            url,
		InstallationId: installationId,
	}
}

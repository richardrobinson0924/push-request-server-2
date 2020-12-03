package parsers

import (
	"fmt"
	"github.com/google/go-github/github"
	"push-request/models"
)

func ParseRawEventPayload(payload interface{}) *models.Event {
	var parsedEvent *models.Event

	switch e := payload.(type) {
	case *github.IssuesEvent:
		parsedEvent = parseIssuesEvent(e)

	case *github.PullRequestReviewEvent:
		parsedEvent = parsePRReview(e)

	case *github.PullRequestEvent:
		parsedEvent = parsePullRequest(e)

	default:
		return nil
	}

	return parsedEvent
}

func parsePullRequest(e *github.PullRequestEvent) *models.Event {
	pr := e.GetPullRequest()

	var eventType models.EventType
	var description string

	switch e.GetAction() {
	case "opened":
		eventType, description = models.PrOpened, fmt.Sprintf("Opened #%d", pr.GetNumber())

	case "review_requested":
		eventType, description = models.PrReviewRequested, fmt.Sprintf("Requested review by @%s", pr.RequestedReviewers[0].GetLogin())

	case "closed":
		if pr.GetMerged() {
			eventType, description = models.PrMerged, fmt.Sprintf("Merged #%d into %s", pr.GetNumber(), pr.GetBase().GetRef())
		} else {
			eventType, description = models.PrClosed, fmt.Sprintf("Closed #%d", pr.GetNumber())
		}

	default:
		return nil
	}

	return models.NewEvent(
		eventType,
		e.GetRepo().GetFullName(),
		pr.GetNumber(),
		pr.GetTitle(),
		description,
		e.GetSender().GetAvatarURL(),
		pr.GetUpdatedAt(),
		pr.GetHTMLURL(),
		e.GetInstallation().GetID(),
	)
}

func parsePRReview(e *github.PullRequestReviewEvent) *models.Event {
	pr := e.GetPullRequest()

	var description string

	if e.GetAction() != "submitted" {
		return nil
	}

	switch e.GetReview().GetState() {
	case "changes_requested":
		description = fmt.Sprintf("Requested changes on #%d", pr.GetNumber())

	case "approved":
		description = fmt.Sprintf("Approved #%d", pr.GetNumber())

	case "dismissed":
		description = fmt.Sprintf("Dismissed #%d", pr.GetNumber())

	case "commented":
		description = fmt.Sprintf("Commented on #%d", pr.GetNumber())

	default:
		return nil
	}

	return models.NewEvent(
		models.PrReviewed,
		e.GetRepo().GetFullName(),
		pr.GetNumber(),
		pr.GetTitle(),
		description,
		e.GetSender().GetAvatarURL(),
		pr.GetUpdatedAt(),
		pr.GetHTMLURL(),
		e.GetInstallation().GetID(),
	)
}

func parseIssuesEvent(e *github.IssuesEvent) *models.Event {
	issue := e.GetIssue()

	var eventType models.EventType
	var description string

	switch e.GetAction() {
	case "opened":
		eventType, description = models.IssueOpened, fmt.Sprintf("Opened #%d", issue.GetNumber())

	case "closed":
		eventType, description = models.IssueClosed, fmt.Sprintf("Closed #%d", issue.GetNumber())

	case "assigned":
		eventType, description = models.IssueAssigned, fmt.Sprintf("Assigned #%d to @%s", issue.GetNumber(), issue.GetAssignee().GetLogin())

	default:
		return nil
	}

	return models.NewEvent(
		eventType,
		e.GetRepo().GetFullName(),
		issue.GetNumber(),
		issue.GetTitle(),
		description,
		e.GetSender().GetAvatarURL(),
		issue.GetUpdatedAt(),
		issue.GetHTMLURL(),
		e.GetInstallation().GetID(),
	)
}

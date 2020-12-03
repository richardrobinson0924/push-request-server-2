package tests

import (
	"github.com/google/go-github/github"
	"io/ioutil"
	"push-request/models"
	"push-request/parsers"
	"testing"
	"time"
)

func TestIssueParsing(t *testing.T) {
	data, _ := ioutil.ReadFile("./fixtures/issue.json")
	event, _ := github.ParseWebHook("issues", data)
	date, _ := time.Parse(time.RFC3339, "2019-05-15T15:20:18Z")

	got := *parsers.ParseRawEventPayload(event)
	want := *models.NewEvent(
		models.IssueAssigned,
		"Codertocat/Hello-World",
		1,
		"Spelling error in the README file",
		"Assigned #1 to @Codertocat",
		"https://avatars1.githubusercontent.com/u/21031067?v=4",
		date,
		"https://github.com/Codertocat/Hello-World/issues/1",
		2,
	)

	if got != want {
		t.Fatalf("\n got %v\nwant %v", got, want)
	}
}

func TestPullRequestParsing(t *testing.T) {
	data, _ := ioutil.ReadFile("./fixtures/pull_request.json")
	event, _ := github.ParseWebHook("pull_request", data)
	date, _ := time.Parse(time.RFC3339, "2019-05-15T15:20:33Z")

	got := *parsers.ParseRawEventPayload(event)
	want := *models.NewEvent(
		models.PrOpened,
		"Codertocat/Hello-World",
		2,
		"Update the README with new information.",
		"Opened #2",
		"https://avatars1.githubusercontent.com/u/21031067?v=4",
		date,
		"https://github.com/Codertocat/Hello-World/pull/2",
		2,
	)

	if got != want {
		t.Errorf("\n got %v\nwant %v", got, want)
	}
}

func TestPRReviewParsing(t *testing.T) {
	data, _ := ioutil.ReadFile("./fixtures/pr_review.json")
	event, _ := github.ParseWebHook("pull_request_review", data)
	date, _ := time.Parse(time.RFC3339, "2019-05-15T15:20:38Z")

	got := *parsers.ParseRawEventPayload(event)
	want := *models.NewEvent(
		models.PrReviewed,
		"Codertocat/Hello-World",
		2,
		"Update the README with new information.",
		"Approved #2",
		"https://avatars1.githubusercontent.com/u/21031067?v=4",
		date,
		"https://github.com/Codertocat/Hello-World/pull/2",
		2,
	)

	if got != want {
		t.Errorf("\n got %v\nwant %v", got, want)
	}
}

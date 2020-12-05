package tests

import (
	"bytes"
	"crypto/tls"
	"github.com/Kamva/mgm"
	"github.com/sideshow/apns2"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/mongo/options"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"os"
	"push-request/handlers"
	"push-request/models"
	"testing"
	"time"
)

func mockClient() *apns2.Client {
	return apns2.NewClient(tls.Certificate{})
}

func handleInstallationEvent(t *testing.T) {
	data, _ := ioutil.ReadFile("./fixtures/installation.json")

	req, err := http.NewRequest("POST", "/webhook", bytes.NewReader(data))
	if err != nil {
		t.Fatal(err)
	}

	req.Header.Add("X-Github-Event", "installation")

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.HandleWebhook)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusCreated, rr.Code)

	installation, err := models.GetInstallation(2)
	assert.NoError(t, err)

	assert.Equal(t, int64(1), installation.GithubId)
}

func handleEventPayload(t *testing.T) {
	_ = models.CreateInstallation(2, 1)
	_ = models.CreateUser(1, "a", []models.EventType{models.IssueAssigned})

	handlers.SetAPNSClient(mockClient())

	data, _ := ioutil.ReadFile("./fixtures/issue.json")

	req, err := http.NewRequest("POST", "/webhook", bytes.NewReader(data))
	if err != nil {
		t.Fatal(err)
	}

	req.Header.Add("X-Github-Event", "issues")

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.HandleWebhook)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	user, err := models.GetUser(1)
	assert.NoError(t, err)

	date, _ := time.Parse(time.RFC3339, "2019-05-15T15:20:18Z")
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

	assert.Equal(t, want, user.LatestEvent)
}

func TestWebhookHandler(t *testing.T) {
	_ = os.Setenv("DB_NAME", "push_request_3")
	_ = os.Setenv("DB_URI", "mongodb://localhost:27017")

	err := mgm.SetDefaultConfig(nil, os.Getenv("DB_NAME"), options.Client().ApplyURI(os.Getenv("DB_URI")))
	if err != nil {
		t.Fatal(err)
	}

	_ = mgm.Coll(&models.User{}).Drop(mgm.Ctx())
	_ = mgm.Coll(&models.Installation{}).Drop(mgm.Ctx())

	t.Run("handle_installation_event", handleInstallationEvent)

	_ = mgm.Coll(&models.Installation{}).Drop(mgm.Ctx())

	t.Run("handle_event_payload", handleEventPayload)
}

package tests

import (
	"bytes"
	"encoding/json"
	"github.com/kamva/mgm"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/mongo/options"
	"net/http"
	"net/http/httptest"
	"os"
	"push-request/handlers"
	"push-request/models"
	"testing"
)

type UserPostData struct {
	GithubId     int64              `json:"github_id,omitempty"`
	DeviceToken  string             `json:"device_token,omitempty"`
	AllowedTypes []models.EventType `json:"allowed_types,omitempty"`
}

type UserPatchData struct {
	DeviceTokens []string           `json:"device_tokens,omitempty"`
	AllowedTypes []models.EventType `json:"allowed_types,omitempty"`
}

func testPostUser201(t *testing.T) {
	data := UserPostData{
		GithubId:     1234,
		DeviceToken:  "a",
		AllowedTypes: []models.EventType{models.IssueOpened},
	}

	encoded, _ := json.Marshal(data)

	req, err := http.NewRequest("POST", "/users", bytes.NewReader(encoded))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.HandleUser)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusCreated, rr.Code)

	user, _ := models.GetUser(1234)

	assert.Contains(t, user.DeviceTokens, "a")
	assert.Equal(t, data.AllowedTypes, user.AllowedTypes)
}

func testPatchUser200(t *testing.T) {
	_ = models.CreateUser(1234, "a", []models.EventType{models.IssueOpened})

	data := UserPatchData{
		DeviceTokens: []string{"b"},
	}

	encoded, _ := json.Marshal(data)

	req, err := http.NewRequest("PATCH", "/users", bytes.NewReader(encoded))
	if err != nil {
		t.Fatal(err)
	}

	req.Header.Add("Authorization", "1234")

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.HandleUser)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	user, _ := models.GetUser(1234)

	assert.Contains(t, user.DeviceTokens, "b")
	assert.Contains(t, user.AllowedTypes, models.IssueOpened)
}

func testPostUser400(t *testing.T) {
	data := UserPostData{
		GithubId:     1234,
		DeviceToken:  "a",
		AllowedTypes: []models.EventType{models.IssueOpened},
	}

	_ = models.CreateUser(1234, "a", []models.EventType{models.IssueOpened})

	encoded, _ := json.Marshal(data)

	req, err := http.NewRequest("POST", "/users", bytes.NewReader(encoded))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.HandleUser)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func testGetUser200(t *testing.T) {
	_ = models.CreateUser(1234, "a", []models.EventType{models.IssueOpened})

	req, err := http.NewRequest("GET", "/users", nil)
	if err != nil {
		t.Fatal(err)
	}

	req.Header.Add("Authorization", "1234")

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.HandleUser)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	want := models.User{
		GithubId:     1234,
		DeviceTokens: []string{"a"},
		AllowedTypes: []models.EventType{models.IssueOpened},
	}
	got := models.User{}
	_ = json.NewDecoder(rr.Body).Decode(&got)

	assert.Equal(t, want.GithubId, got.GithubId)
	assert.Equal(t, want.DeviceTokens, got.DeviceTokens)
	assert.Equal(t, want.AllowedTypes, got.AllowedTypes)
}

func testGetUser404(t *testing.T) {
	req, err := http.NewRequest("GET", "/users", nil)
	if err != nil {
		t.Fatal(err)
	}

	req.Header.Add("Authorization", "5678")

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.HandleUser)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusNotFound, rr.Code)
}

func TestUserHandler(t *testing.T) {
	_ = os.Setenv("DB_NAME", "push_request_3")
	_ = os.Setenv("DB_URI", "mongodb://localhost:27017")

	err := mgm.SetDefaultConfig(nil, os.Getenv("DB_NAME"), options.Client().ApplyURI(os.Getenv("DB_URI")))
	if err != nil {
		t.Fatal(err)
	}

	_ = mgm.Coll(&models.User{}).Drop(mgm.Ctx())

	t.Run("test-POST-user-creation", testPostUser201)
	t.Run("test-POST-user-already-exists", testPostUser400)

	t.Run("test-GET-user", testGetUser200)
	t.Run("test-GET-user-not-found", testGetUser404)

	t.Run("test-PATCH-user", testPatchUser200)
}

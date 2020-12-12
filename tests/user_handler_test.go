package tests

import (
	"bytes"
	"encoding/json"
	"github.com/Kamva/mgm"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/mongo/options"
	"net/http"
	"net/http/httptest"
	"os"
	"push-request/handlers"
	"push-request/models"
	"testing"
)

type UserPatchData struct {
	DeviceTokens []string           `json:"device_tokens,omitempty"`
	AllowedTypes []models.EventType `json:"allowed_types,omitempty"`
}

func testPostUser201(t *testing.T) {
	data := models.User{
		GithubId:     1234,
		DeviceTokens: []string{"a"},
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
		AllowedTypes: []models.EventType{models.PrMerged},
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

	assert.Contains(t, user.DeviceTokens, "a")
	assert.Equal(t, user.AllowedTypes, []models.EventType{models.PrMerged})
}

func testPostUser400(t *testing.T) {
	data := models.User{
		GithubId:     1234,
		DeviceTokens: []string{"a"},
		AllowedTypes: []models.EventType{models.IssueOpened},
	}

	_ = models.CreateUser(1234, "b", []models.EventType{models.IssueOpened})

	encoded, _ := json.Marshal(data)

	req, err := http.NewRequest("POST", "/users", bytes.NewReader(encoded))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.HandleUser)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	user, _ := models.GetUser(1234)
	assert.Equal(t, user.DeviceTokens, []string{"b", "a"})
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
	_ = os.Setenv("DB_NAME", "push_request_api_test")
	_ = os.Setenv("DB_URI", "mongodb://localhost:27017")

	err := mgm.SetDefaultConfig(nil, os.Getenv("DB_NAME"), options.Client().ApplyURI(os.Getenv("DB_URI")))
	if err != nil {
		t.Fatal(err)
	}

	testMap := map[string]func(*testing.T){
		"test-POST-user-creation":       testPostUser201,
		"test-POST-user-already-exists": testPostUser400,
		"test-GET-user":                 testGetUser200,
		"test-GET-user-not-found":       testGetUser404,
		"test-PATCH-user":               testPatchUser200,
	}

	for testName, test := range testMap {
		_ = mgm.Coll(&models.User{}).Drop(mgm.Ctx())
		t.Run(testName, test)
	}
}

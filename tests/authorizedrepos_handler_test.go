package tests

import (
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

func handleGetAuthorizedRepos(t *testing.T) {
	_ = models.CreateInstallation(2, 1, []models.Repository{
		models.NewRepository(1, "a"),
		models.NewRepository(2, "b"),
	})

	_ = models.CreateInstallation(3, 1, []models.Repository{
		models.NewRepository(2, "b"),
		models.NewRepository(3, "c"),
	})

	req, err := http.NewRequest("GET", "/authorized_repos", nil)
	if err != nil {
		t.Fatal(err)
	}

	req.Header.Add("Authorization", "1")

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.HandleAuthorizedRepos)

	handler.ServeHTTP(rr, req)

	want := []models.Repository{
		models.NewRepository(1, "a"),
		models.NewRepository(2, "b"),
		models.NewRepository(3, "c"),
	}

	var got []models.Repository
	_ = json.NewDecoder(rr.Body).Decode(&got)

	assert.Equal(t, want, got)
}

func TestAuthorizedReposHandler(t *testing.T) {
	_ = os.Setenv("DB_NAME", "push_request_3")
	_ = os.Setenv("DB_URI", "mongodb://localhost:27017")

	err := mgm.SetDefaultConfig(nil, os.Getenv("DB_NAME"), options.Client().ApplyURI(os.Getenv("DB_URI")))
	if err != nil {
		t.Fatal(err)
	}

	_ = mgm.Coll(&models.User{}).Drop(mgm.Ctx())
	_ = mgm.Coll(&models.Installation{}).Drop(mgm.Ctx())

	t.Run("handle_get_authorized_repos", handleGetAuthorizedRepos)
}

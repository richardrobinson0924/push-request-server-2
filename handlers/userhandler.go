package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"push-request/models"
	"strconv"
)

func handlePostUser(w http.ResponseWriter, r *http.Request) {
	var data struct {
		GithubId     int64              `json:"github_id"`
		DeviceToken  string             `json:"device_token"`
		AllowedTypes []models.EventType `json:"allowed_types"`
	}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println("handle POST user: Failed to decode request body")
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	_, err = models.GetUser(data.GithubId)
	if err == nil {
		fmt.Println("handle POST user: User with id", data.GithubId, "already exists")
		http.Error(w, "User already exists", http.StatusBadRequest)
		return
	}

	err = models.CreateUser(data.GithubId, data.DeviceToken, data.AllowedTypes)
	if err != nil {
		fmt.Println("handle POST user: Failed to create user", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func handleGetUser(w http.ResponseWriter, r *http.Request) {
	authString := r.Header.Get("Authorization")
	githubId, err := strconv.Atoi(authString)

	if err != nil {
		fmt.Println("handle GET user", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user, err := models.GetUser(int64(githubId))
	if err != nil {
		fmt.Println("handle GET user", err.Error())
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	bytes, err := json.Marshal(user)
	if err != nil {
		fmt.Println("handle GET user", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if _, err = w.Write(bytes); err != nil {
		fmt.Println("handle GET user", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func handlePatchUser(w http.ResponseWriter, r *http.Request) {
	authString := r.Header.Get("Authorization")
	githubId, err := strconv.Atoi(authString)

	if err != nil {
		fmt.Println("handle PATCH user", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user, err := models.GetUser(int64(githubId))
	if err != nil {
		fmt.Println("handle PATCH user", err.Error())
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	var data struct {
		DeviceTokens []string           `json:"device_tokens,omitempty"`
		AllowedTypes []models.EventType `json:"allowed_types,omitempty"`
	}

	err = json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println("handle PATCH user", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if data.DeviceTokens != nil {
		user.DeviceTokens = data.DeviceTokens
	}

	if data.AllowedTypes != nil {
		user.AllowedTypes = data.AllowedTypes
	}

	err = user.Save()
	if err != nil {
		fmt.Println("handle PATCH user", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func HandleUser(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		fmt.Println("POST /users")
		handlePostUser(w, r)

	case http.MethodGet:
		fmt.Println("GET /users")
		handleGetUser(w, r)

	case http.MethodPatch:
		fmt.Println("PATCH /users")
		handlePatchUser(w, r)

	default:
		http.Error(w, "Invalid Method", http.StatusMethodNotAllowed)
	}
}

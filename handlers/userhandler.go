package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"push-request/models"
	"strconv"
)

func containsString(array []string, element string) bool {
	for _, a := range array {
		if a == element {
			return true
		}
	}
	return false
}

// Creates a new User with the specified github id, device token, and allowed types
// If a User with the github id already exists, the user is updated with the new device token
func handlePostUser(w http.ResponseWriter, r *http.Request) {
	var user models.User

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		fmt.Println("handle POST user: Failed to decode request body")
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	existingUser, err := models.GetUser(user.GithubId)
	if err == nil {
		if !containsString(existingUser.DeviceTokens, user.DeviceTokens[0]) {
			fmt.Println("User with github id", user.GithubId, "already exists. Appending device token...")
			existingUser.DeviceTokens = append(existingUser.DeviceTokens, user.DeviceTokens[0])
			_ = existingUser.Save()
		}

		w.WriteHeader(http.StatusOK)
		return
	}

	err = models.CreateUser(user.GithubId, user.DeviceTokens[0], user.AllowedTypes)
	if err != nil {
		fmt.Println("handle POST user: Failed to create user", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// Gets a User using the github id specified in the `Authorization` header
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

// Updates a User with new data. Currently, the only fields supported are `allowed_types`
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
		AllowedTypes []models.EventType `json:"allowed_types,omitempty"`
	}

	err = json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println("handle PATCH user", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
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

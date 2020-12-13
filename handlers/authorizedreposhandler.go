package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"push-request/models"
	"strconv"
)

func removeDuplicates(slice []models.Repository) []models.Repository {
	keys := make(map[models.Repository]bool)
	var list []models.Repository

	for _, entry := range slice {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}

func flatMapAuthorizedRepos(array []models.Installation) []models.Repository {
	var result []models.Repository
	for _, element := range array {
		result = append(result, element.AuthorizedRepos...)
	}
	return result
}

func HandleAuthorizedRepos(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GET /authorized_repos")

	authString := r.Header.Get("Authorization")
	githubId, err := strconv.Atoi(authString)

	if err != nil {
		fmt.Println("handle GET authorized repo", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	installations, err := models.GetAllInstallationsFromGithubId(int64(githubId))
	if err != nil {
		fmt.Println("handle GET authorized repo", err.Error())
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	repos := removeDuplicates(flatMapAuthorizedRepos(installations))

	bytes, err := json.Marshal(repos)
	if err != nil {
		fmt.Println("handle GET authorized repo", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if _, err = w.Write(bytes); err != nil {
		fmt.Println("handle GET authorized repo", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

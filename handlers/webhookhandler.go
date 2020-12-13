package handlers

import (
	"fmt"
	"github.com/google/go-github/github"
	"github.com/sideshow/apns2"
	"io/ioutil"
	"net/http"
	"os"
	"push-request/models"
	"push-request/parsers"
)

var apnsClient *apns2.Client

func SetAPNSClient(client *apns2.Client) {
	apnsClient = client
}

func containsEventType(array []models.EventType, element models.EventType) bool {
	for _, a := range array {
		if a == element {
			return true
		}
	}
	return false
}

func sendAPNSNotification(token string) error {
	notification := &apns2.Notification{
		DeviceToken: token,
		Topic:       os.Getenv("APNS_TOPIC"),
		Priority:    apns2.PriorityLow,
		PushType:    apns2.PushTypeBackground,
		Payload:     []byte(`{"aps":{"content-available":1}}`),
	}

	_, err := apnsClient.Push(notification)
	if err != nil {
		return fmt.Errorf("failed to send APNS notification (%w)", err)
	}

	return nil
}

func handleInstallationEvent(event *github.InstallationEvent) (bool, error) {
	if event.GetAction() != "created" {
		return false, nil
	}

	githubId := event.GetInstallation().GetAccount().GetID()
	installationId := event.GetInstallation().GetID()

	var repos []models.Repository
	for _, githubRepo := range event.Repositories {
		var repo = models.NewRepository(
			githubRepo.GetID(),
			githubRepo.GetFullName(),
		)
		repos = append(repos, repo)
	}

	if err := models.CreateInstallation(installationId, githubId, repos); err != nil {
		return false, fmt.Errorf("failed to create installation (%w)", err)
	}

	return true, nil
}

func getUser(installationId int64) (*models.User, error) {
	installation, err := models.GetInstallation(installationId)
	if err != nil {
		return nil, fmt.Errorf("error getting installation with id %d (%w)", installationId, err)
	}

	user, err := models.GetUser(installation.GithubId)
	if err != nil {
		return nil, fmt.Errorf("error getting user with github id %d (%w)", installation.GithubId, err)

	}

	return user, nil
}

func HandleWebhook(w http.ResponseWriter, r *http.Request) {
	payload, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Println("handle webhook error", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer r.Body.Close()

	fmt.Println("webhook received: ", github.WebHookType(r))

	event, err := github.ParseWebHook(github.WebHookType(r), payload)
	if err != nil {
		fmt.Println("handle webhook error", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	switch event := event.(type) {
	case *github.InstallationEvent:
		isCreated, err := handleInstallationEvent(event)
		if err != nil {
			fmt.Println(err.Error())
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if isCreated {
			w.WriteHeader(http.StatusCreated)
			return
		}

		w.WriteHeader(http.StatusOK)
		return

	default:
	}

	parsedEvent := parsers.ParseRawEventPayload(event)
	if parsedEvent == nil {
		fmt.Println("parsed event is nil")
		w.WriteHeader(http.StatusOK)
		return
	}

	user, err := getUser(parsedEvent.InstallationId)
	if err != nil {
		fmt.Println(err.Error())
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if !containsEventType(user.AllowedTypes, parsedEvent.EventType) {
		w.WriteHeader(http.StatusOK)
		return
	}

	user.LatestEvent = parsedEvent
	if err = user.Save(); err != nil {
		fmt.Println("handle webhook error", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for _, token := range user.DeviceTokens {
		if err = sendAPNSNotification(token); err != nil {
			fmt.Println(err.Error())
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

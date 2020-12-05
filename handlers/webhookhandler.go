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
	"push-request/utils"
)

var apnsClient *apns2.Client

func SetAPNSClient(client *apns2.Client) {
	apnsClient = client
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
	return err
}

func handleInstallationEvent(event *github.InstallationEvent) (bool, error) {
	if event.GetAction() != "created" {
		return false, nil
	}

	githubId := event.GetInstallation().GetAccount().GetID()
	installationId := event.GetInstallation().GetID()

	if err := models.CreateInstallation(installationId, githubId); err != nil {
		return false, err
	}

	return true, nil
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
			fmt.Println("handle webhook error", err.Error())
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

	installation, err := models.GetInstallation(parsedEvent.InstallationId)
	if err != nil {
		fmt.Println("handle webhook error", err.Error())
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	user, err := models.GetUser(installation.GithubId)
	if err != nil {
		fmt.Println("handle webhook error", err.Error())
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if !utils.Contains(user.AllowedTypes, parsedEvent.EventType) {
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
			fmt.Println("handle webhook error", err.Error())
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

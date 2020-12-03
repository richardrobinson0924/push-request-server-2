package main

import (
	"fmt"
	"github.com/kamva/mgm"
	"github.com/sideshow/apns2"
	"github.com/sideshow/apns2/token"
	"go.mongodb.org/mongo-driver/mongo/options"
	"net/http"
	"os"
	"push-request/handlers"
)

func init() {
	err := mgm.SetDefaultConfig(nil, os.Getenv("DB_NAME"), options.Client().ApplyURI(os.Getenv("DB_URI")))
	if err != nil {
		panic(err)
	}
}

func setupAPNS() {
	authKey, _ := token.AuthKeyFromBytes([]byte(os.Getenv("APNS_AUTH_KEY")))
	apnsToken := &token.Token{
		AuthKey: authKey,
		KeyID:   os.Getenv("APNS_KID"),
		TeamID:  os.Getenv("APNS_ISS"),
	}

	var client = apns2.NewTokenClient(apnsToken)

	if os.Getenv("GO_ENV") == "DEVELOPMENT" {
		client = client.Development()
	} else {
		client = client.Production()
	}

	handlers.SetAPNSClient(client)
}

func main() {
	setupAPNS()

	http.HandleFunc("/users", handlers.HandleUser)
	http.HandleFunc("/webhook", handlers.HandleWebhook)

	fmt.Println("Listening...")

	err := http.ListenAndServe(fmt.Sprintf(":%s", os.Getenv("PORT")), nil)
	if err != nil {
		panic(err)
	}
}

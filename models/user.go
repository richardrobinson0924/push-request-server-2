package models

import (
	"github.com/Kamva/mgm"
	"go.mongodb.org/mongo-driver/bson"
)

type User struct {
	mgm.DefaultModel `bson:",inline"`
	GithubId         int64       `json:"github_id" bson:"github_id"`
	DeviceTokens     []string    `json:"device_tokens" bson:"device_tokens"`
	LatestEvent      Event       `json:"latest_event,omitempty" bson:"latest_event,omitempty"`
	AllowedTypes     []EventType `json:"allowed_types" bson:"allowed_types"`
}

func CreateUser(githubId int64, deviceToken string, allowedTypes []EventType) error {
	user := &User{
		GithubId:     githubId,
		DeviceTokens: []string{deviceToken},
		AllowedTypes: allowedTypes,
	}

	return mgm.Coll(user).Create(user)
}

func (user *User) Save() error {
	return mgm.Coll(user).Update(user)
}

func GetUser(githubId int64) (user *User, error error) {
	res := &User{}
	coll := mgm.Coll(user)

	err := coll.First(bson.M{"github_id": githubId}, res)
	return res, err
}

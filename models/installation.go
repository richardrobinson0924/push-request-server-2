package models

import (
	"github.com/kamva/mgm"
	"go.mongodb.org/mongo-driver/bson"
)

type Installation struct {
	mgm.DefaultModel `bson:",inline"`
	Id               int64 `json:"installation_id" bson:"installation_id"`
	GithubId         int64 `json:"github_id" bson:"github_id"`
}

func CreateInstallation(id int64, githubId int64) error {
	installation := &Installation{
		Id:       id,
		GithubId: githubId,
	}

	return mgm.Coll(installation).Create(installation)
}

func GetInstallation(installationId int64) (installation *Installation, error error) {
	res := &Installation{}
	coll := mgm.Coll(installation)

	err := coll.First(bson.M{"installation_id": installationId}, res)
	return res, err
}

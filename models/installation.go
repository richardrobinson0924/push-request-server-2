package models

import (
	"github.com/Kamva/mgm"
	"go.mongodb.org/mongo-driver/bson"
)

type Installation struct {
	mgm.DefaultModel `bson:",inline"`
	Id               int64        `json:"installation_id" bson:"installation_id"`
	GithubId         int64        `json:"github_id" bson:"github_id"`
	AuthorizedRepos  []Repository `json:"authorized_repos" bson:"authorized_repos"`
}

func CreateInstallation(id int64, githubId int64, authorizedRepos []Repository) error {
	installation := &Installation{
		Id:              id,
		GithubId:        githubId,
		AuthorizedRepos: authorizedRepos,
	}

	return mgm.Coll(installation).Create(installation)
}

func GetInstallation(installationId int64) (installation *Installation, error error) {
	res := &Installation{}
	coll := mgm.Coll(installation)

	err := coll.First(bson.M{"installation_id": installationId}, res)
	return res, err
}

func GetAllInstallationsFromGithubId(githubId int64) (installation []Installation, error error) {
	coll := mgm.Coll(&Installation{})
	var result []Installation

	err := coll.SimpleFind(&result, bson.M{"github_id": githubId})
	return result, err
}

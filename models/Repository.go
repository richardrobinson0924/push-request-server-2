package models

type Repository struct {
	Id       int64  `json:"id" bson:"id"`
	FullName string `json:"full_name" bson:"full_name"`
}

func NewRepository(id int64, fullName string) Repository {
	return Repository{
		Id:       id,
		FullName: fullName,
	}
}

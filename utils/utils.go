package utils

import (
	"push-request/models"
)

func Contains(array []models.EventType, element models.EventType) bool {
	for _, a := range array {
		if a == element {
			return true
		}
	}
	return false
}

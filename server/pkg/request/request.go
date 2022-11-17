package request

import (
	"time"
)

type Request struct {
	id          ID
	title       string
	description string
	createdBy   UserID
	reviewers   []UserID
	state       State
	timestamp   time.Time
}

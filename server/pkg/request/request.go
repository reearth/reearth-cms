package request

import (
	"time"
)

type Request struct {
	id          ID
	item        ItemID
	title       string
	description string
	createdBy   UserID
	reviewers   []UserID
	state       State
	timestamp   time.Time
}

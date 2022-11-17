package request

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/item"
)

type Request struct {
	id          ID
	title       string
	description string
	createdBy   item.UserID
	reviewers   []item.UserID
	state       State
	timestamp   time.Time
}

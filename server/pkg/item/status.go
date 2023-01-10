package item

import "strings"

type Status string

var (
	StatusDraft  Status = "draft"
	StatusReview Status = "review"
	StatusPublic Status = "public"
)

func (s Status) String() string {
	return string(s)
}

func StatusFrom(s string) Status {
	ss := strings.ToLower(s)
	switch Status(ss) {
	case StatusDraft:
		return StatusDraft
	case StatusPublic:
		return StatusPublic
	case StatusReview:
		return StatusReview
	default:
		return Status("")
	}
}

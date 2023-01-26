package item

type Status string

var (
	StatusDraft  Status = "draft"
	StatusReview Status = "review"
	StatusPublic Status = "public"
)

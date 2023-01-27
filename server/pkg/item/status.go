package item

type Status int

var (
	StatusDraft        Status = 0
	StatusChanged      Status = 1
	StatusReview       Status = 2
	StatusPublic       Status = 3
	StatusPublicDraft  Status = 4
	StatusPublicReview Status = 5
)

func (s Status) Wrap(s2 Status) Status {
	if (s == StatusPublic || s2 == StatusPublic) && (s == StatusReview || s2 == StatusReview) {
		return StatusPublicReview
	}
	if (s == StatusPublic || s2 == StatusPublic) && (s == StatusChanged || s2 == StatusChanged) {
		return StatusPublicDraft
	}
	if s > s2 {
		return s
	}
	return s2
}

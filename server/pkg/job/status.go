package job

import "strings"

type Status string

const (
	StatusPending    Status = "pending"
	StatusInProgress Status = "in_progress"
	StatusCompleted  Status = "completed"
	StatusFailed     Status = "failed"
	StatusCancelled  Status = "cancelled"
)

func StatusFrom(s string) (Status, bool) {
	ss := strings.ToLower(s)
	switch Status(ss) {
	case StatusPending:
		return StatusPending, true
	case StatusInProgress:
		return StatusInProgress, true
	case StatusCompleted:
		return StatusCompleted, true
	case StatusFailed:
		return StatusFailed, true
	case StatusCancelled:
		return StatusCancelled, true
	default:
		return Status(""), false
	}
}

func StatusFromRef(s *string) *Status {
	if s == nil {
		return nil
	}
	ss, ok := StatusFrom(*s)
	if !ok {
		return nil
	}
	return &ss
}

func (s Status) String() string {
	return string(s)
}

func (s *Status) StringRef() *string {
	if s == nil {
		return nil
	}
	s2 := string(*s)
	return &s2
}

func (s Status) IsFinished() bool {
	return s == StatusCompleted || s == StatusFailed || s == StatusCancelled
}

package asset

import (
	"strings"
)

type Status string

const (
	StatusPending    Status = "pending"
	StatusInProgress Status = "in_progress"
	StatusDone       Status = "done"
	StatusFailed     Status = "failed"
)

func StatusFrom(s string) (Status, bool) {
	ss := strings.ToLower(s)
	switch Status(ss) {
	case StatusPending:
		return StatusPending, true
	case StatusInProgress:
		return StatusInProgress, true
	case StatusDone:
		return StatusDone, true
	case StatusFailed:
		return StatusFailed, true
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

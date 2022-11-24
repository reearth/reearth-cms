package request

import (
	"errors"
	"time"
)

var (
	ErrEmptyItems = errors.New("items cannot be empty")
	ErrEmptyTitle = errors.New("title cannot be empty")
	ErrEmptyDesc  = errors.New("description cannot be empty")
)

type Request struct {
	id          ID
	workspace   WorkspaceID
	project     ProjectID
	items       []*Item
	title       string
	description string
	createdBy   UserID
	reviewers   []UserID
	state       State
	updatedAt   time.Time
	approvedAt  *time.Time
	closedAt    *time.Time
	thread      ThreadID
}

func (r *Request) ID() ID {
	return r.id
}

func (r *Request) Workspace() WorkspaceID {
	return r.workspace
}

func (r *Request) Project() ProjectID {
	return r.project
}

func (r *Request) Items() []*Item {
	return r.items
}

func (r *Request) Title() string {
	return r.title
}

func (r *Request) Description() string {
	return r.description
}

func (r *Request) CreatedBy() UserID {
	return r.createdBy
}

func (r *Request) Reviewers() []UserID {
	return r.reviewers
}

func (r *Request) State() State {
	return r.state
}

func (r *Request) CreatedAt() time.Time {
	return r.id.Timestamp()
}

func (r *Request) UpdatedAt() time.Time {
	return r.updatedAt
}

func (r *Request) ApprovedAt() *time.Time {
	return r.approvedAt
}

func (r *Request) ClosedAt() *time.Time {
	return r.closedAt
}

func (r *Request) Thread() ThreadID {
	return r.thread
}

func (r *Request) SetTitle(title string) error {
	if title == "" {
		return ErrEmptyTitle
	}
	r.title = title
	return nil
}

func (r *Request) SetDescription(description string) error {
	if description == "" {
		return ErrEmptyDesc
	}
	r.description = description
	return nil
}

func (r *Request) SetReviewers(reviewers []UserID) error {
	if reviewers == nil || len(reviewers) == 0 {
		return ErrEmptyItems
	}
	r.reviewers = reviewers
	return nil
}

func (r *Request) SetState(state State) {
	r.state = state
}

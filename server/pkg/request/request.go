package request

import (
	"errors"
	"time"

	"golang.org/x/exp/slices"
)

var (
	ErrEmptyItems = errors.New("items cannot be empty")
	ErrEmptyTitle = errors.New("title cannot be empty")
)

type Request struct {
	id          ID
	workspace   WorkspaceID
	project     ProjectID
	items       ItemList
	title       string
	description string
	createdBy   UserID
	reviewers   UserIDList
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

func (r *Request) Items() ItemList {
	return slices.Clone(r.items)
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

func (r *Request) Reviewers() UserIDList {
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

func (r *Request) SetDescription(description string) {
	r.description = description
}

func (r *Request) SetReviewers(reviewers []UserID) {
	r.reviewers = reviewers
}

func (r *Request) SetItems(items ItemList) {
	r.items = slices.Clone(items)
}

func (r *Request) SetState(state State) {
	r.state = state
}

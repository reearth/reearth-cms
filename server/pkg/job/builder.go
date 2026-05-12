package job

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/reearth/reearthx/account/accountdomain"
)

var (
	ErrInvalidID        = errors.New("invalid job id")
	ErrNoProjectID      = errors.New("project id is required")
	ErrNoUser           = errors.New("user or integration is required")
	ErrInvalidJobType   = errors.New("invalid job type")
	ErrInvalidJobStatus = errors.New("invalid job status")
)

type Builder struct {
	j *Job
}

func New() *Builder {
	return &Builder{j: &Job{
		status: StatusPending,
	}}
}

func (b *Builder) Build() (*Job, error) {
	if b.j.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.j.projectID.IsNil() {
		return nil, ErrNoProjectID
	}
	if b.j.user == nil && b.j.integration == nil {
		return nil, ErrNoUser
	}
	if b.j.jobType == "" {
		return nil, ErrInvalidJobType
	}
	if b.j.updatedAt.IsZero() {
		b.j.updatedAt = b.j.id.Timestamp()
	}
	return b.j, nil
}

func (b *Builder) MustBuild() *Job {
	j, err := b.Build()
	if err != nil {
		panic(err)
	}
	return j
}

func (b *Builder) ID(id ID) *Builder {
	b.j.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.j.id = NewID()
	return b
}

func (b *Builder) Type(t Type) *Builder {
	b.j.jobType = t
	return b
}

func (b *Builder) Status(s Status) *Builder {
	b.j.status = s
	return b
}

func (b *Builder) Project(pid ProjectID) *Builder {
	b.j.projectID = pid
	return b
}

func (b *Builder) User(uid accountdomain.UserID) *Builder {
	b.j.user = &uid
	b.j.integration = nil
	return b
}

func (b *Builder) Integration(iid IntegrationID) *Builder {
	b.j.integration = &iid
	b.j.user = nil
	return b
}

func (b *Builder) Progress(p Progress) *Builder {
	b.j.progress = p
	return b
}

func (b *Builder) Payload(p json.RawMessage) *Builder {
	b.j.payload = p
	return b
}

func (b *Builder) Result(r json.RawMessage) *Builder {
	b.j.result = r
	return b
}

func (b *Builder) Error(err string) *Builder {
	b.j.errorMsg = err
	return b
}

func (b *Builder) UpdatedAt(t time.Time) *Builder {
	b.j.updatedAt = t
	return b
}

func (b *Builder) StartedAt(t *time.Time) *Builder {
	b.j.startedAt = t
	return b
}

func (b *Builder) CompletedAt(t *time.Time) *Builder {
	b.j.completedAt = t
	return b
}

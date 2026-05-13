package mongodoc

import (
	"encoding/json"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
)

type JobDocument struct {
	ID          string
	Type        string
	Status      string
	ProjectID   string
	User        *string
	Integration *string
	Processed   int
	Total       int
	Payload     json.RawMessage
	Result      json.RawMessage
	Error       string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	StartedAt   *time.Time
	CompletedAt *time.Time
}

func NewJob(j *job.Job) (*JobDocument, string, error) {
	jID := j.ID().String()

	var uid, iid *string
	if j.User() != nil {
		uid = j.User().StringRef()
	}
	if j.Integration() != nil {
		iid = j.Integration().StringRef()
	}

	return &JobDocument{
		ID:          jID,
		Type:        j.Type().String(),
		Status:      j.Status().String(),
		ProjectID:   j.ProjectID().String(),
		User:        uid,
		Integration: iid,
		Processed:   j.Progress().Processed(),
		Total:       j.Progress().Total(),
		Payload:     j.Payload(),
		Result:      j.Result(),
		Error:       j.Error(),
		CreatedAt:   j.CreatedAt(),
		UpdatedAt:   j.UpdatedAt(),
		StartedAt:   j.StartedAt(),
		CompletedAt: j.CompletedAt(),
	}, jID, nil
}

func (d *JobDocument) Model() (*job.Job, error) {
	jID, err := id.JobIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	pID, err := id.ProjectIDFrom(d.ProjectID)
	if err != nil {
		return nil, err
	}

	jt, ok := job.TypeFrom(d.Type)
	if !ok {
		return nil, job.ErrInvalidJobType
	}

	js, ok := job.StatusFrom(d.Status)
	if !ok {
		return nil, job.ErrInvalidJobStatus
	}

	b := job.New().
		ID(jID).
		Type(jt).
		Status(js).
		Project(pID).
		Progress(job.NewProgress(d.Processed, d.Total)).
		Payload(d.Payload).
		Result(d.Result).
		Error(d.Error).
		UpdatedAt(d.UpdatedAt).
		StartedAt(d.StartedAt).
		CompletedAt(d.CompletedAt)

	if d.User != nil {
		uid := accountdomain.UserIDFromRef(d.User)
		if uid != nil {
			b = b.User(*uid)
		}
	}
	if d.Integration != nil {
		iid := id.IntegrationIDFromRef(d.Integration)
		if iid != nil {
			b = b.Integration(*iid)
		}
	}

	return b.Build()
}

type JobConsumer = mongox.SliceFuncConsumer[*JobDocument, *job.Job]

func NewJobConsumer() *JobConsumer {
	return NewConsumer[*JobDocument, *job.Job]()
}

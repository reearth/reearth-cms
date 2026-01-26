package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
)

type Job interface {
	FindByID(context.Context, id.JobID) (*job.Job, error)
	FindByProject(context.Context, id.ProjectID, *job.Type, *job.Status) ([]*job.Job, error)
	Save(context.Context, *job.Job) error
}

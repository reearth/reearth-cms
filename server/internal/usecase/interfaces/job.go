package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
)

type Job interface {
	FindByID(context.Context, id.JobID, *usecase.Operator) (*job.Job, error)
	FindByProject(context.Context, id.ProjectID, *job.Type, *job.Status, *usecase.Operator) ([]*job.Job, error)
	Cancel(context.Context, id.JobID, *usecase.Operator) (*job.Job, error)
	Subscribe(context.Context, id.JobID, *usecase.Operator) (<-chan job.State, error)
}

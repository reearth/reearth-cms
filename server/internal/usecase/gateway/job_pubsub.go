package gateway

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
)

type JobPubSub interface {
	Publish(ctx context.Context, jobID id.JobID, progress job.Progress) error
	Subscribe(ctx context.Context, jobID id.JobID) (<-chan job.Progress, error)
	Unsubscribe(jobID id.JobID)
}

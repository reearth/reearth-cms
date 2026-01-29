package gateway

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
)

type JobPubSub interface {
	Publish(ctx context.Context, jobID id.JobID, state job.State) error
	Subscribe(ctx context.Context, jobID id.JobID) (<-chan job.State, error)
	Unsubscribe(jobID id.JobID)
}

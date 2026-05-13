package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var (
	ErrJobNotFound = rerror.NewE(i18n.T("job not found"))
)

type Job struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewJob(r *repo.Container, g *gateway.Container) interfaces.Job {
	return &Job{
		repos:    r,
		gateways: g,
	}
}

func (i *Job) FindByID(ctx context.Context, jobID id.JobID, _ *usecase.Operator) (*job.Job, error) {
	j, err := i.repos.Job.FindByID(ctx, jobID)
	if err != nil {
		return nil, err
	}
	if j == nil {
		return nil, ErrJobNotFound
	}
	return j, nil
}

func (i *Job) FindByProject(ctx context.Context, projectID id.ProjectID, jobType *job.Type, status *job.Status, _ *usecase.Operator) ([]*job.Job, error) {
	return i.repos.Job.FindByProject(ctx, projectID, jobType, status)
}

func (i *Job) Cancel(ctx context.Context, jobID id.JobID, _ *usecase.Operator) (*job.Job, error) {
	j, err := i.repos.Job.FindByID(ctx, jobID)
	if err != nil {
		return nil, err
	}
	if j == nil {
		return nil, ErrJobNotFound
	}

	if j.IsFinished() {
		return j, nil // Already finished, nothing to cancel
	}

	j.Cancel()

	if err := i.repos.Job.Save(ctx, j); err != nil {
		return nil, err
	}

	return j, nil
}

func (i *Job) Subscribe(ctx context.Context, jobID id.JobID, _ *usecase.Operator) (<-chan job.State, error) {
	// Verify job exists
	j, err := i.repos.Job.FindByID(ctx, jobID)
	if err != nil {
		return nil, err
	}
	if j == nil {
		return nil, ErrJobNotFound
	}

	if i.gateways == nil || i.gateways.JobPubSub == nil {
		return nil, rerror.ErrInternalBy(errors.New("job pubsub gateway is not configured"))
	}

	// If no publisher is active, return the current job state immediately
	if !i.gateways.JobPubSub.HasPublisher(jobID) {
		ch := make(chan job.State, 1)
		ch <- j.State()
		close(ch)
		return ch, nil
	}

	return i.gateways.JobPubSub.Subscribe(ctx, jobID)
}

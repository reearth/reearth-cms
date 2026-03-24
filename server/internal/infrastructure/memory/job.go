package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type Job struct {
	data *util.SyncMap[id.JobID, *job.Job]
	err  error
}

func NewJob() repo.Job {
	return &Job{
		data: &util.SyncMap[id.JobID, *job.Job]{},
	}
}

func (r *Job) FindByID(_ context.Context, jobID id.JobID) (*job.Job, error) {
	if r.err != nil {
		return nil, r.err
	}

	j := r.data.Find(func(k id.JobID, v *job.Job) bool {
		return k == jobID
	})

	if j != nil {
		return j, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Job) FindByProject(_ context.Context, projectID id.ProjectID, jobType *job.Type, status *job.Status) ([]*job.Job, error) {
	if r.err != nil {
		return nil, r.err
	}

	result := make([]*job.Job, 0)
	r.data.Range(func(_ id.JobID, j *job.Job) bool {
		if j.ProjectID() != projectID {
			return true
		}
		if jobType != nil && j.Type() != *jobType {
			return true
		}
		if status != nil && j.Status() != *status {
			return true
		}
		result = append(result, j)
		return true
	})

	return result, nil
}

func (r *Job) Save(_ context.Context, j *job.Job) error {
	if r.err != nil {
		return r.err
	}

	r.data.Store(j.ID(), j.Clone())
	return nil
}

package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/job"
)

func ToJob(j *job.Job) *Job {
	if j == nil {
		return nil
	}

	var errStr *string
	if e := j.Error(); e != "" {
		errStr = &e
	}

	return &Job{
		ID:          IDFrom(j.ID()),
		Type:        ToJobType(j.Type()),
		ProjectID:   IDFrom(j.ProjectID()),
		Status:      ToJobStatus(j.Status()),
		Progress:    ToJobProgress(j.Progress()),
		Error:       errStr,
		CreatedAt:   j.CreatedAt(),
		UpdatedAt:   j.UpdatedAt(),
		StartedAt:   j.StartedAt(),
		CompletedAt: j.CompletedAt(),
	}
}

func ToJobType(t job.Type) JobType {
	switch t {
	case job.TypeImport:
		return JobTypeImport
	default:
		return JobTypeImport
	}
}

func ToJobStatus(s job.Status) JobStatus {
	switch s {
	case job.StatusPending:
		return JobStatusPending
	case job.StatusInProgress:
		return JobStatusInProgress
	case job.StatusCompleted:
		return JobStatusCompleted
	case job.StatusFailed:
		return JobStatusFailed
	case job.StatusCancelled:
		return JobStatusCancelled
	default:
		return JobStatusPending
	}
}

func ToJobProgress(p job.Progress) *JobProgress {
	return &JobProgress{
		Processed:  p.Processed(),
		Total:      p.Total(),
		Percentage: p.Percentage(),
	}
}

func FromJobType(t *JobType) *job.Type {
	if t == nil {
		return nil
	}
	var jt job.Type
	switch *t {
	case JobTypeImport:
		jt = job.TypeImport
	default:
		jt = job.TypeImport
	}
	return &jt
}

func FromJobStatus(s *JobStatus) *job.Status {
	if s == nil {
		return nil
	}
	var js job.Status
	switch *s {
	case JobStatusPending:
		js = job.StatusPending
	case JobStatusInProgress:
		js = job.StatusInProgress
	case JobStatusCompleted:
		js = job.StatusCompleted
	case JobStatusFailed:
		js = job.StatusFailed
	case JobStatusCancelled:
		js = job.StatusCancelled
	default:
		js = job.StatusPending
	}
	return &js
}

package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
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
		ID:           IDFrom(j.ID()),
		Type:         ToJobType(j.Type()),
		ProjectID:    IDFrom(j.ProjectID()),
		Status:       ToJobStatus(j.Status()),
		Progress:     ToJobProgress(j.Progress()),
		Error:        errStr,
		CreatedAt:    j.CreatedAt(),
		UpdatedAt:    j.UpdatedAt(),
		StartedAt:    j.StartedAt(),
		CompletedAt:  j.CompletedAt(),
		ImportResult: ToImportJobResult(j),
	}
}

// ToImportJobResult returns the stored result of an import job, or nil if the job is not
// an import job, has not completed yet, or stored a result that cannot be read.
func ToImportJobResult(j *job.Job) *ImportJobResult {
	r, err := j.ImportResult()
	if err != nil {
		log.Warnf("gql: job %s has an unreadable import result: %v", j.ID(), err)
		return nil
	}
	if r == nil {
		return nil
	}

	return &ImportJobResult{
		Total:    r.Total,
		Inserted: r.Inserted,
		Updated:  r.Updated,
		Ignored:  r.Ignored,
		Columns: lo.Map(r.Columns, func(c job.ImportColumnResult, _ int) *ImportColumnResult {
			return &ImportColumnResult{
				Header:         c.Header,
				Status:         ToImportColumnStatus(interfaces.ImportColumnStatus(c.Status)),
				SchemaFieldKey: c.SchemaFieldKey,
				Reason:         c.Reason,
			}
		}),
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

func ToJobState(s job.State) *JobState {
	var progress *JobProgress
	if p := s.Progress(); p != nil {
		progress = ToJobProgress(*p)
	}

	var errStr *string
	if e := s.Error(); e != "" {
		errStr = &e
	}

	return &JobState{
		Status:   ToJobStatus(s.Status()),
		Progress: progress,
		Error:    errStr,
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

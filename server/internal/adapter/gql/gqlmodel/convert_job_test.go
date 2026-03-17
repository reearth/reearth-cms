package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/stretchr/testify/assert"
)

func TestToJobState(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		state          job.State
		wantStatus     JobStatus
		wantProgress   bool
		wantError      bool
		wantProcessed  int
		wantTotal      int
		wantPercentage float64
		wantErrorMsg   string
	}{
		{
			name:         "pending state without progress",
			state:        job.NewState(job.StatusPending, nil, ""),
			wantStatus:   JobStatusPending,
			wantProgress: false,
			wantError:    false,
		},
		{
			name: "in_progress state with progress",
			state: func() job.State {
				p := job.NewProgress(50, 100)
				return job.NewState(job.StatusInProgress, &p, "")
			}(),
			wantStatus:     JobStatusInProgress,
			wantProgress:   true,
			wantError:      false,
			wantProcessed:  50,
			wantTotal:      100,
			wantPercentage: 50.0,
		},
		{
			name:         "in_progress state without progress",
			state:        job.NewState(job.StatusInProgress, nil, ""),
			wantStatus:   JobStatusInProgress,
			wantProgress: false,
			wantError:    false,
		},
		{
			name: "completed state",
			state: func() job.State {
				p := job.NewProgress(100, 100)
				return job.NewState(job.StatusCompleted, &p, "")
			}(),
			wantStatus:   JobStatusCompleted,
			wantProgress: false, // progress is nil for completed status
			wantError:    false,
		},
		{
			name:         "failed state with error",
			state:        job.NewState(job.StatusFailed, nil, "import failed: invalid data"),
			wantStatus:   JobStatusFailed,
			wantProgress: false,
			wantError:    true,
			wantErrorMsg: "import failed: invalid data",
		},
		{
			name:         "cancelled state",
			state:        job.NewState(job.StatusCancelled, nil, ""),
			wantStatus:   JobStatusCancelled,
			wantProgress: false,
			wantError:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := ToJobState(tt.state)

			assert.NotNil(t, result)
			assert.Equal(t, tt.wantStatus, result.Status)

			if tt.wantProgress {
				assert.NotNil(t, result.Progress)
				assert.Equal(t, tt.wantProcessed, result.Progress.Processed)
				assert.Equal(t, tt.wantTotal, result.Progress.Total)
				assert.InDelta(t, tt.wantPercentage, result.Progress.Percentage, 0.0001)
			} else {
				assert.Nil(t, result.Progress)
			}

			if tt.wantError {
				assert.NotNil(t, result.Error)
				assert.Equal(t, tt.wantErrorMsg, *result.Error)
			} else {
				assert.Nil(t, result.Error)
			}
		})
	}
}

func TestToJobProgress(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		progress       job.Progress
		wantProcessed  int
		wantTotal      int
		wantPercentage float64
	}{
		{
			name:           "zero progress",
			progress:       job.NewProgress(0, 0),
			wantProcessed:  0,
			wantTotal:      0,
			wantPercentage: 0,
		},
		{
			name:           "partial progress",
			progress:       job.NewProgress(25, 100),
			wantProcessed:  25,
			wantTotal:      100,
			wantPercentage: 25.0,
		},
		{
			name:           "complete progress",
			progress:       job.NewProgress(100, 100),
			wantProcessed:  100,
			wantTotal:      100,
			wantPercentage: 100.0,
		},
		{
			name:           "fractional percentage",
			progress:       job.NewProgress(1, 3),
			wantProcessed:  1,
			wantTotal:      3,
			wantPercentage: 100.0 / 3.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := ToJobProgress(tt.progress)

			assert.NotNil(t, result)
			assert.Equal(t, tt.wantProcessed, result.Processed)
			assert.Equal(t, tt.wantTotal, result.Total)
			assert.InDelta(t, tt.wantPercentage, result.Percentage, 0.0001)
		})
	}
}

func TestToJobStatus(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		status job.Status
		want   JobStatus
	}{
		{name: "pending", status: job.StatusPending, want: JobStatusPending},
		{name: "in_progress", status: job.StatusInProgress, want: JobStatusInProgress},
		{name: "completed", status: job.StatusCompleted, want: JobStatusCompleted},
		{name: "failed", status: job.StatusFailed, want: JobStatusFailed},
		{name: "cancelled", status: job.StatusCancelled, want: JobStatusCancelled},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := ToJobStatus(tt.status)
			assert.Equal(t, tt.want, result)
		})
	}
}

func TestToJobType(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		jobType job.Type
		want    JobType
	}{
		{name: "import", jobType: job.TypeImport, want: JobTypeImport},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := ToJobType(tt.jobType)
			assert.Equal(t, tt.want, result)
		})
	}
}

func TestFromJobType(t *testing.T) {
	t.Parallel()

	t.Run("nil input returns nil", func(t *testing.T) {
		t.Parallel()
		assert.Nil(t, FromJobType(nil))
	})

	t.Run("import type", func(t *testing.T) {
		t.Parallel()
		jt := JobTypeImport
		result := FromJobType(&jt)
		assert.NotNil(t, result)
		assert.Equal(t, job.TypeImport, *result)
	})
}

func TestFromJobStatus(t *testing.T) {
	t.Parallel()

	t.Run("nil input returns nil", func(t *testing.T) {
		t.Parallel()
		assert.Nil(t, FromJobStatus(nil))
	})

	tests := []struct {
		name   string
		status JobStatus
		want   job.Status
	}{
		{name: "pending", status: JobStatusPending, want: job.StatusPending},
		{name: "in_progress", status: JobStatusInProgress, want: job.StatusInProgress},
		{name: "completed", status: JobStatusCompleted, want: job.StatusCompleted},
		{name: "failed", status: JobStatusFailed, want: job.StatusFailed},
		{name: "cancelled", status: JobStatusCancelled, want: job.StatusCancelled},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			status := tt.status
			result := FromJobStatus(&status)
			assert.NotNil(t, result)
			assert.Equal(t, tt.want, *result)
		})
	}
}

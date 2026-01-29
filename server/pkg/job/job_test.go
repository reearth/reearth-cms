package job

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
)

func TestJob_Getters(t *testing.T) {
	now := time.Now()
	jid := NewID()
	pid := id.NewProjectID()
	uid := accountdomain.NewUserID()
	progress := NewProgress(50, 100)
	payload := json.RawMessage(`{"test": "data"}`)
	result := json.RawMessage(`{"result": "ok"}`)
	startedAt := now.Add(-time.Hour)
	completedAt := now

	j := &Job{
		id:          jid,
		jobType:     TypeImport,
		status:      StatusCompleted,
		projectID:   pid,
		user:        &uid,
		progress:    progress,
		payload:     payload,
		result:      result,
		errorMsg:    "some error",
		updatedAt:   now,
		startedAt:   &startedAt,
		completedAt: &completedAt,
	}

	assert.Equal(t, jid, j.ID())
	assert.Equal(t, TypeImport, j.Type())
	assert.Equal(t, StatusCompleted, j.Status())
	assert.Equal(t, pid, j.ProjectID())
	assert.Equal(t, &uid, j.User())
	assert.Nil(t, j.Integration())
	assert.Equal(t, progress, j.Progress())
	assert.Equal(t, payload, j.Payload())
	assert.Equal(t, result, j.Result())
	assert.Equal(t, "some error", j.Error())
	assert.Equal(t, now, j.UpdatedAt())
	assert.Equal(t, &startedAt, j.StartedAt())
	assert.Equal(t, &completedAt, j.CompletedAt())
}

func TestJob_CreatedAt(t *testing.T) {
	jid := NewID()
	j := &Job{id: jid}

	// CreatedAt should return the timestamp from the ID
	assert.Equal(t, jid.Timestamp(), j.CreatedAt())
}

func TestJob_SetStatus(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	j := &Job{status: StatusPending}

	j.SetStatus(StatusInProgress)

	assert.Equal(t, StatusInProgress, j.Status())
	assert.Equal(t, now, j.UpdatedAt())
}

func TestJob_SetProgress(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	j := &Job{}
	progress := NewProgress(25, 100)

	j.SetProgress(progress)

	assert.Equal(t, progress, j.Progress())
	assert.Equal(t, now, j.UpdatedAt())
}

func TestJob_SetResult(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	j := &Job{}
	result := json.RawMessage(`{"data": "test"}`)

	j.SetResult(result)

	assert.Equal(t, result, j.Result())
	assert.Equal(t, now, j.UpdatedAt())
}

func TestJob_SetError(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	j := &Job{}

	j.SetError("something went wrong")

	assert.Equal(t, "something went wrong", j.Error())
	assert.Equal(t, now, j.UpdatedAt())
}

func TestJob_Start(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	j := &Job{status: StatusPending}

	j.Start()

	assert.Equal(t, StatusInProgress, j.Status())
	assert.NotNil(t, j.StartedAt())
	assert.Equal(t, now, *j.StartedAt())
	assert.Equal(t, now, j.UpdatedAt())
}

func TestJob_Complete(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	j := &Job{status: StatusInProgress}
	result := json.RawMessage(`{"total": 100}`)

	j.Complete(result)

	assert.Equal(t, StatusCompleted, j.Status())
	assert.Equal(t, result, j.Result())
	assert.NotNil(t, j.CompletedAt())
	assert.Equal(t, now, *j.CompletedAt())
	assert.Equal(t, now, j.UpdatedAt())
}

func TestJob_Fail(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	j := &Job{status: StatusInProgress}

	j.Fail("import failed: invalid data")

	assert.Equal(t, StatusFailed, j.Status())
	assert.Equal(t, "import failed: invalid data", j.Error())
	assert.NotNil(t, j.CompletedAt())
	assert.Equal(t, now, *j.CompletedAt())
	assert.Equal(t, now, j.UpdatedAt())
}

func TestJob_Cancel(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	j := &Job{status: StatusInProgress}

	j.Cancel()

	assert.Equal(t, StatusCancelled, j.Status())
	assert.NotNil(t, j.CompletedAt())
	assert.Equal(t, now, *j.CompletedAt())
	assert.Equal(t, now, j.UpdatedAt())
}

func TestJob_IsCancelled(t *testing.T) {
	tests := []struct {
		name   string
		status Status
		want   bool
	}{
		{
			name:   "pending is not cancelled",
			status: StatusPending,
			want:   false,
		},
		{
			name:   "in_progress is not cancelled",
			status: StatusInProgress,
			want:   false,
		},
		{
			name:   "completed is not cancelled",
			status: StatusCompleted,
			want:   false,
		},
		{
			name:   "failed is not cancelled",
			status: StatusFailed,
			want:   false,
		},
		{
			name:   "cancelled is cancelled",
			status: StatusCancelled,
			want:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			j := &Job{status: tt.status}
			assert.Equal(t, tt.want, j.IsCancelled())
		})
	}
}

func TestJob_IsFinished(t *testing.T) {
	tests := []struct {
		name   string
		status Status
		want   bool
	}{
		{
			name:   "pending is not finished",
			status: StatusPending,
			want:   false,
		},
		{
			name:   "in_progress is not finished",
			status: StatusInProgress,
			want:   false,
		},
		{
			name:   "completed is finished",
			status: StatusCompleted,
			want:   true,
		},
		{
			name:   "failed is finished",
			status: StatusFailed,
			want:   true,
		},
		{
			name:   "cancelled is finished",
			status: StatusCancelled,
			want:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			j := &Job{status: tt.status}
			assert.Equal(t, tt.want, j.IsFinished())
		})
	}
}

func TestJob_State(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		status       Status
		progress     Progress
		errorMsg     string
		wantProgress bool
	}{
		{
			name:         "pending job returns state without progress",
			status:       StatusPending,
			progress:     NewProgress(0, 0),
			errorMsg:     "",
			wantProgress: false,
		},
		{
			name:         "in_progress job returns state with progress",
			status:       StatusInProgress,
			progress:     NewProgress(50, 100),
			errorMsg:     "",
			wantProgress: true,
		},
		{
			name:         "completed job returns state without progress",
			status:       StatusCompleted,
			progress:     NewProgress(100, 100),
			errorMsg:     "",
			wantProgress: false,
		},
		{
			name:         "failed job returns state with error",
			status:       StatusFailed,
			progress:     NewProgress(50, 100),
			errorMsg:     "import failed",
			wantProgress: false,
		},
		{
			name:         "cancelled job returns state without progress",
			status:       StatusCancelled,
			progress:     NewProgress(50, 100),
			errorMsg:     "",
			wantProgress: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			j := &Job{
				status:   tt.status,
				progress: tt.progress,
				errorMsg: tt.errorMsg,
			}

			state := j.State()

			assert.Equal(t, tt.status, state.Status())
			assert.Equal(t, tt.errorMsg, state.Error())

			if tt.wantProgress {
				assert.NotNil(t, state.Progress())
				assert.Equal(t, tt.progress.Processed(), state.Progress().Processed())
				assert.Equal(t, tt.progress.Total(), state.Progress().Total())
			} else {
				assert.Nil(t, state.Progress())
			}
		})
	}
}

func TestJob_Clone(t *testing.T) {
	t.Run("nil job returns nil", func(t *testing.T) {
		t.Parallel()

		var j *Job
		assert.Nil(t, j.Clone())
	})

	t.Run("clones all fields", func(t *testing.T) {
		t.Parallel()

		now := time.Now()
		jid := NewID()
		pid := id.NewProjectID()
		uid := accountdomain.NewUserID()
		startedAt := now.Add(-time.Hour)
		completedAt := now

		original := &Job{
			id:          jid,
			jobType:     TypeImport,
			status:      StatusCompleted,
			projectID:   pid,
			user:        &uid,
			progress:    NewProgress(100, 100),
			payload:     json.RawMessage(`{"test": "data"}`),
			result:      json.RawMessage(`{"result": "ok"}`),
			errorMsg:    "error",
			updatedAt:   now,
			startedAt:   &startedAt,
			completedAt: &completedAt,
		}

		cloned := original.Clone()

		assert.NotSame(t, original, cloned)
		assert.Equal(t, original.ID(), cloned.ID())
		assert.Equal(t, original.Type(), cloned.Type())
		assert.Equal(t, original.Status(), cloned.Status())
		assert.Equal(t, original.ProjectID(), cloned.ProjectID())
		assert.Equal(t, *original.User(), *cloned.User())
		assert.NotSame(t, original.User(), cloned.User())
		assert.Equal(t, original.Progress(), cloned.Progress())
		assert.Equal(t, original.Payload(), cloned.Payload())
		assert.Equal(t, original.Result(), cloned.Result())
		assert.Equal(t, original.Error(), cloned.Error())
		assert.Equal(t, original.UpdatedAt(), cloned.UpdatedAt())
		assert.Equal(t, *original.StartedAt(), *cloned.StartedAt())
		assert.NotSame(t, original.StartedAt(), cloned.StartedAt())
		assert.Equal(t, *original.CompletedAt(), *cloned.CompletedAt())
		assert.NotSame(t, original.CompletedAt(), cloned.CompletedAt())
	})

	t.Run("clones job with integration", func(t *testing.T) {
		t.Parallel()

		iid := id.NewIntegrationID()
		original := &Job{
			id:          NewID(),
			integration: &iid,
		}

		cloned := original.Clone()

		assert.Equal(t, *original.Integration(), *cloned.Integration())
		assert.NotSame(t, original.Integration(), cloned.Integration())
	})
}

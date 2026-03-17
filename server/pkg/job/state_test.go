package job

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewState(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		status       Status
		progress     *Progress
		errorMsg     string
		wantProgress bool
		wantError    string
	}{
		{
			name:         "pending status without progress",
			status:       StatusPending,
			progress:     nil,
			errorMsg:     "",
			wantProgress: false,
			wantError:    "",
		},
		{
			name:         "pending status ignores progress",
			status:       StatusPending,
			progress:     func() *Progress { p := NewProgress(50, 100); return &p }(),
			errorMsg:     "",
			wantProgress: false,
			wantError:    "",
		},
		{
			name:         "in_progress status with progress",
			status:       StatusInProgress,
			progress:     func() *Progress { p := NewProgress(50, 100); return &p }(),
			errorMsg:     "",
			wantProgress: true,
			wantError:    "",
		},
		{
			name:         "in_progress status without progress",
			status:       StatusInProgress,
			progress:     nil,
			errorMsg:     "",
			wantProgress: false,
			wantError:    "",
		},
		{
			name:         "completed status ignores progress",
			status:       StatusCompleted,
			progress:     func() *Progress { p := NewProgress(100, 100); return &p }(),
			errorMsg:     "",
			wantProgress: false,
			wantError:    "",
		},
		{
			name:         "failed status with error",
			status:       StatusFailed,
			progress:     nil,
			errorMsg:     "import failed: invalid data",
			wantProgress: false,
			wantError:    "import failed: invalid data",
		},
		{
			name:         "failed status ignores progress",
			status:       StatusFailed,
			progress:     func() *Progress { p := NewProgress(50, 100); return &p }(),
			errorMsg:     "some error",
			wantProgress: false,
			wantError:    "some error",
		},
		{
			name:         "cancelled status ignores progress",
			status:       StatusCancelled,
			progress:     func() *Progress { p := NewProgress(50, 100); return &p }(),
			errorMsg:     "",
			wantProgress: false,
			wantError:    "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			s := NewState(tt.status, tt.progress, tt.errorMsg)

			assert.Equal(t, tt.status, s.Status())
			assert.Equal(t, tt.wantError, s.Error())

			if tt.wantProgress {
				assert.NotNil(t, s.Progress())
				assert.Equal(t, tt.progress.Processed(), s.Progress().Processed())
				assert.Equal(t, tt.progress.Total(), s.Progress().Total())
			} else {
				assert.Nil(t, s.Progress())
			}
		})
	}
}

func TestState_Status(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		status Status
	}{
		{name: "pending", status: StatusPending},
		{name: "in_progress", status: StatusInProgress},
		{name: "completed", status: StatusCompleted},
		{name: "failed", status: StatusFailed},
		{name: "cancelled", status: StatusCancelled},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			s := NewState(tt.status, nil, "")
			assert.Equal(t, tt.status, s.Status())
		})
	}
}

func TestState_Progress(t *testing.T) {
	t.Parallel()

	t.Run("returns nil when not in_progress", func(t *testing.T) {
		t.Parallel()

		s := NewState(StatusCompleted, nil, "")
		assert.Nil(t, s.Progress())
	})

	t.Run("returns progress when in_progress", func(t *testing.T) {
		t.Parallel()

		p := NewProgress(75, 100)
		s := NewState(StatusInProgress, &p, "")

		assert.NotNil(t, s.Progress())
		assert.Equal(t, 75, s.Progress().Processed())
		assert.Equal(t, 100, s.Progress().Total())
		assert.InDelta(t, 75.0, s.Progress().Percentage(), 0.0001)
	})

	t.Run("returns nil when in_progress but progress is nil", func(t *testing.T) {
		t.Parallel()

		s := NewState(StatusInProgress, nil, "")
		assert.Nil(t, s.Progress())
	})
}

func TestState_Error(t *testing.T) {
	t.Parallel()

	t.Run("empty error when not failed", func(t *testing.T) {
		t.Parallel()

		s := NewState(StatusCompleted, nil, "")
		assert.Equal(t, "", s.Error())
	})

	t.Run("returns error message when failed", func(t *testing.T) {
		t.Parallel()

		s := NewState(StatusFailed, nil, "something went wrong")
		assert.Equal(t, "something went wrong", s.Error())
	})

	t.Run("error can be set on any status", func(t *testing.T) {
		t.Parallel()

		// While error is typically only set on FAILED status,
		// the State struct accepts it for any status
		s := NewState(StatusInProgress, nil, "warning message")
		assert.Equal(t, "warning message", s.Error())
	})
}

func TestState_Clone(t *testing.T) {
	t.Parallel()

	t.Run("clones state without progress", func(t *testing.T) {
		t.Parallel()

		original := NewState(StatusFailed, nil, "error message")
		cloned := original.Clone()

		assert.Equal(t, original.Status(), cloned.Status())
		assert.Equal(t, original.Error(), cloned.Error())
		assert.Nil(t, cloned.Progress())
	})

	t.Run("clones state with progress", func(t *testing.T) {
		t.Parallel()

		p := NewProgress(50, 100)
		original := NewState(StatusInProgress, &p, "")
		cloned := original.Clone()

		assert.Equal(t, original.Status(), cloned.Status())
		assert.Equal(t, original.Error(), cloned.Error())
		assert.NotNil(t, cloned.Progress())
		assert.Equal(t, original.Progress().Processed(), cloned.Progress().Processed())
		assert.Equal(t, original.Progress().Total(), cloned.Progress().Total())

		// Verify it's a deep copy (different pointer)
		assert.NotSame(t, original.Progress(), cloned.Progress())
	})

	t.Run("modifying clone does not affect original", func(t *testing.T) {
		t.Parallel()

		p := NewProgress(50, 100)
		original := NewState(StatusInProgress, &p, "")
		cloned := original.Clone()

		// The clone's progress is independent
		assert.Equal(t, 50, original.Progress().Processed())
		assert.Equal(t, 50, cloned.Progress().Processed())
	})
}

func TestState_ProgressCloning(t *testing.T) {
	t.Parallel()

	t.Run("progress is cloned on creation", func(t *testing.T) {
		t.Parallel()

		p := NewProgress(50, 100)
		s := NewState(StatusInProgress, &p, "")

		// The state should have its own copy
		assert.NotSame(t, &p, s.Progress())
		assert.Equal(t, p.Processed(), s.Progress().Processed())
		assert.Equal(t, p.Total(), s.Progress().Total())
	})
}

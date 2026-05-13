package job

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestStatusFrom(t *testing.T) {
	tests := []struct {
		name   string
		input  string
		want   Status
		wantOk bool
	}{
		{
			name:   "pending",
			input:  "pending",
			want:   StatusPending,
			wantOk: true,
		},
		{
			name:   "in_progress",
			input:  "in_progress",
			want:   StatusInProgress,
			wantOk: true,
		},
		{
			name:   "completed",
			input:  "completed",
			want:   StatusCompleted,
			wantOk: true,
		},
		{
			name:   "failed",
			input:  "failed",
			want:   StatusFailed,
			wantOk: true,
		},
		{
			name:   "cancelled",
			input:  "cancelled",
			want:   StatusCancelled,
			wantOk: true,
		},
		{
			name:   "uppercase PENDING",
			input:  "PENDING",
			want:   StatusPending,
			wantOk: true,
		},
		{
			name:   "mixed case Completed",
			input:  "Completed",
			want:   StatusCompleted,
			wantOk: true,
		},
		{
			name:   "invalid status",
			input:  "unknown",
			want:   Status(""),
			wantOk: false,
		},
		{
			name:   "empty string",
			input:  "",
			want:   Status(""),
			wantOk: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, ok := StatusFrom(tt.input)
			assert.Equal(t, tt.wantOk, ok)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestStatusFromRef(t *testing.T) {
	tests := []struct {
		name  string
		input *string
		want  *Status
	}{
		{
			name:  "nil input",
			input: nil,
			want:  nil,
		},
		{
			name:  "valid status",
			input: lo.ToPtr("pending"),
			want:  lo.ToPtr(StatusPending),
		},
		{
			name:  "invalid status",
			input: lo.ToPtr("unknown"),
			want:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := StatusFromRef(tt.input)
			if tt.want == nil {
				assert.Nil(t, got)
			} else {
				assert.NotNil(t, got)
				assert.Equal(t, *tt.want, *got)
			}
		})
	}
}

func TestStatus_String(t *testing.T) {
	tests := []struct {
		name   string
		status Status
		want   string
	}{
		{
			name:   "pending",
			status: StatusPending,
			want:   "pending",
		},
		{
			name:   "in_progress",
			status: StatusInProgress,
			want:   "in_progress",
		},
		{
			name:   "completed",
			status: StatusCompleted,
			want:   "completed",
		},
		{
			name:   "failed",
			status: StatusFailed,
			want:   "failed",
		},
		{
			name:   "cancelled",
			status: StatusCancelled,
			want:   "cancelled",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, tt.status.String())
		})
	}
}

func TestStatus_StringRef(t *testing.T) {
	t.Run("nil status", func(t *testing.T) {
		t.Parallel()

		var s *Status
		assert.Nil(t, s.StringRef())
	})

	t.Run("non-nil status", func(t *testing.T) {
		t.Parallel()

		s := StatusPending
		got := s.StringRef()
		assert.NotNil(t, got)
		assert.Equal(t, "pending", *got)
	})
}

func TestStatus_IsFinished(t *testing.T) {
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

			assert.Equal(t, tt.want, tt.status.IsFinished())
		})
	}
}

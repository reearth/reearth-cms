package job

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewProgress(t *testing.T) {
	tests := []struct {
		name      string
		processed int
		total     int
	}{
		{
			name:      "zero values",
			processed: 0,
			total:     0,
		},
		{
			name:      "partial progress",
			processed: 50,
			total:     100,
		},
		{
			name:      "complete progress",
			processed: 100,
			total:     100,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			p := NewProgress(tt.processed, tt.total)
			assert.Equal(t, tt.processed, p.Processed())
			assert.Equal(t, tt.total, p.Total())
		})
	}
}

func TestProgress_Percentage(t *testing.T) {
	tests := []struct {
		name      string
		processed int
		total     int
		want      float64
	}{
		{
			name:      "zero total returns zero",
			processed: 0,
			total:     0,
			want:      0,
		},
		{
			name:      "zero processed",
			processed: 0,
			total:     100,
			want:      0,
		},
		{
			name:      "50 percent",
			processed: 50,
			total:     100,
			want:      50,
		},
		{
			name:      "100 percent",
			processed: 100,
			total:     100,
			want:      100,
		},
		{
			name:      "33.33 percent",
			processed: 1,
			total:     3,
			want:      100.0 / 3.0,
		},
		{
			name:      "over 100 percent",
			processed: 150,
			total:     100,
			want:      150,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			p := NewProgress(tt.processed, tt.total)
			assert.InDelta(t, tt.want, p.Percentage(), 0.0001)
		})
	}
}

func TestProgress_Clone(t *testing.T) {
	original := NewProgress(50, 100)
	cloned := original.Clone()

	assert.Equal(t, original.Processed(), cloned.Processed())
	assert.Equal(t, original.Total(), cloned.Total())
	assert.Equal(t, original.Percentage(), cloned.Percentage())
}

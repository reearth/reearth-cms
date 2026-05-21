package project

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewPostingSettings(t *testing.T) {
	t.Parallel()

	assert.True(t, NewPostingSettings(true).Enabled())
	assert.False(t, NewPostingSettings(false).Enabled())
}

func TestPostingSettings_Enabled(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		p    *PostingSettings
		want bool
	}{
		{name: "nil receiver returns false", p: nil, want: false},
		{name: "enabled=true returns true", p: &PostingSettings{enabled: true}, want: true},
		{name: "enabled=false returns false", p: &PostingSettings{enabled: false}, want: false},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.p.Enabled())
		})
	}
}

func TestPostingSettings_Clone(t *testing.T) {
	t.Parallel()

	t.Run("nil returns nil", func(t *testing.T) {
		t.Parallel()
		var p *PostingSettings
		assert.Nil(t, p.Clone())
	})

	t.Run("clone is a distinct copy", func(t *testing.T) {
		t.Parallel()
		p := &PostingSettings{enabled: true}
		c := p.Clone()
		assert.NotSame(t, p, c)
		assert.Equal(t, p.enabled, c.enabled)
	})
}

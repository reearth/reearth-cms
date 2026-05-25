package project

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewPostingSettings(t *testing.T) {
	t.Parallel()

	t.Run("enabled=true", func(t *testing.T) {
		t.Parallel()
		ps := NewPostingSettings(true, nil)
		assert.True(t, ps.Enabled())
		assert.Equal(t, []string{}, ps.AllowedOrigins())
	})

	t.Run("enabled=false", func(t *testing.T) {
		t.Parallel()
		ps := NewPostingSettings(false, nil)
		assert.False(t, ps.Enabled())
		assert.Equal(t, []string{}, ps.AllowedOrigins())
	})

	t.Run("nil allowedOrigins normalises to empty slice", func(t *testing.T) {
		t.Parallel()
		ps := NewPostingSettings(true, nil)
		assert.NotNil(t, ps.AllowedOrigins())
		assert.Equal(t, []string{}, ps.AllowedOrigins())
	})

	t.Run("empty allowedOrigins stays empty", func(t *testing.T) {
		t.Parallel()
		ps := NewPostingSettings(true, []string{})
		assert.Equal(t, []string{}, ps.AllowedOrigins())
	})

	t.Run("non-empty allowedOrigins preserved", func(t *testing.T) {
		t.Parallel()
		origins := []string{"https://a.com", "https://b.com"}
		ps := NewPostingSettings(true, origins)
		assert.Equal(t, origins, ps.AllowedOrigins())
	})
}

func TestPostingSettings_Enabled(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		p    *PostingSettings
		want bool
	}{
		{name: "nil receiver returns false", p: nil, want: false},
		{name: "enabled=true returns true", p: NewPostingSettings(true, nil), want: true},
		{name: "enabled=false returns false", p: NewPostingSettings(false, nil), want: false},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.p.Enabled())
		})
	}
}

func TestPostingSettings_AllowedOrigins(t *testing.T) {
	t.Parallel()

	t.Run("nil receiver returns empty slice", func(t *testing.T) {
		t.Parallel()
		var p *PostingSettings
		assert.Equal(t, []string{}, p.AllowedOrigins())
	})

	t.Run("empty list returns empty slice", func(t *testing.T) {
		t.Parallel()
		p := NewPostingSettings(true, []string{})
		assert.Equal(t, []string{}, p.AllowedOrigins())
	})

	t.Run("populated list is returned as-is", func(t *testing.T) {
		t.Parallel()
		origins := []string{"https://x.com", "https://y.com"}
		p := NewPostingSettings(true, origins)
		assert.Equal(t, origins, p.AllowedOrigins())
	})
}

func TestPostingSettings_Clone(t *testing.T) {
	t.Parallel()

	t.Run("nil returns nil", func(t *testing.T) {
		t.Parallel()
		var p *PostingSettings
		assert.Nil(t, p.Clone())
	})

	t.Run("clone copies enabled", func(t *testing.T) {
		t.Parallel()
		p := NewPostingSettings(true, nil)
		c := p.Clone()
		assert.NotSame(t, p, c)
		assert.Equal(t, p.Enabled(), c.Enabled())
	})

	t.Run("clone copies allowedOrigins as distinct slice", func(t *testing.T) {
		t.Parallel()
		origins := []string{"https://a.com"}
		p := NewPostingSettings(true, origins)
		c := p.Clone()
		assert.Equal(t, p.AllowedOrigins(), c.AllowedOrigins())
		// mutating the clone's backing slice must not affect the original
		c.allowedOrigins[0] = "https://mutated.com"
		assert.Equal(t, "https://a.com", p.AllowedOrigins()[0])
	})

	t.Run("clone with empty origins produces empty slice", func(t *testing.T) {
		t.Parallel()
		p := NewPostingSettings(false, []string{})
		c := p.Clone()
		assert.Equal(t, []string{}, c.AllowedOrigins())
	})
}

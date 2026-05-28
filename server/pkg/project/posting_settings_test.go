package project

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateOrigins(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		origins []string
		wantErr bool
	}{
		// valid
		{name: "empty list is valid", origins: []string{}, wantErr: false},
		{name: "https scheme accepted", origins: []string{"https://example.com"}, wantErr: false},
		{name: "http scheme accepted", origins: []string{"http://example.com"}, wantErr: false},
		{name: "port is allowed", origins: []string{"https://example.com:3000"}, wantErr: false},
		{name: "subdomain is allowed", origins: []string{"https://app.example.com"}, wantErr: false},
		{name: "multiple valid origins", origins: []string{"https://a.com", "http://b.com:8080"}, wantErr: false},
		// wildcards
		{name: "bare wildcard rejected", origins: []string{"*"}, wantErr: true},
		{name: "subdomain wildcard rejected", origins: []string{"https://*.example.com"}, wantErr: true},
		// wrong scheme
		{name: "no scheme rejected", origins: []string{"example.com"}, wantErr: true},
		{name: "ftp scheme rejected", origins: []string{"ftp://example.com"}, wantErr: true},
		// path / query / fragment
		{name: "path rejected", origins: []string{"https://example.com/path"}, wantErr: true},
		{name: "query string rejected", origins: []string{"https://example.com?foo=bar"}, wantErr: true},
		{name: "fragment rejected", origins: []string{"https://example.com#section"}, wantErr: true},
		// mixed: first valid, second invalid
		{name: "invalid entry after valid one is caught", origins: []string{"https://good.com", "https://bad.com/path"}, wantErr: true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := ValidateOrigins(tt.origins)
			if tt.wantErr {
				assert.Error(t, err)
				assert.True(t, errors.Is(err, ErrInvalidOrigin), "expected ErrInvalidOrigin, got: %v", err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

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

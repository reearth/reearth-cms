package project

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// mustNewPS is a test helper that calls NewPostingSettings and fails the test on error.
func mustNewPS(t *testing.T, enabled bool, allowedOrigins []string) *PostingSettings {
	t.Helper()
	ps, err := NewPostingSettings(enabled, allowedOrigins)
	require.NoError(t, err)
	return ps
}

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

	tests := []struct {
		name           string
		enabled        bool
		allowedOrigins []string
		wantErr        bool
		wantEnabled    bool
		wantOrigins    []string
	}{
		{
			name:        "enabled=true with nil origins normalises to empty slice",
			enabled:     true,
			wantEnabled: true,
			wantOrigins: []string{},
		},
		{
			name:        "enabled=false with nil origins",
			enabled:     false,
			wantEnabled: false,
			wantOrigins: []string{},
		},
		{
			name:           "empty allowedOrigins stays empty",
			enabled:        true,
			allowedOrigins: []string{},
			wantEnabled:    true,
			wantOrigins:    []string{},
		},
		{
			name:           "valid origins are preserved",
			enabled:        true,
			allowedOrigins: []string{"https://a.com", "https://b.com"},
			wantEnabled:    true,
			wantOrigins:    []string{"https://a.com", "https://b.com"},
		},
		{
			name:           "invalid origin returns ErrInvalidOrigin",
			enabled:        true,
			allowedOrigins: []string{"not-a-url"},
			wantErr:        true,
		},
		{
			name:           "wildcard origin returns ErrInvalidOrigin",
			enabled:        true,
			allowedOrigins: []string{"*"},
			wantErr:        true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ps, err := NewPostingSettings(tt.enabled, tt.allowedOrigins)
			if tt.wantErr {
				assert.ErrorIs(t, err, ErrInvalidOrigin)
				assert.Nil(t, ps)
			} else {
				require.NoError(t, err)
				require.NotNil(t, ps)
				assert.Equal(t, tt.wantEnabled, ps.Enabled())
				assert.Equal(t, tt.wantOrigins, ps.AllowedOrigins())
			}
		})
	}
}

func TestPostingSettings_Enabled(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		p    *PostingSettings
		want bool
	}{
		{name: "nil receiver returns false", p: nil, want: false},
		{name: "enabled=true returns true", p: mustNewPS(t, true, nil), want: true},
		{name: "enabled=false returns false", p: mustNewPS(t, false, nil), want: false},
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

	tests := []struct {
		name string
		p    *PostingSettings
		want []string
	}{
		{name: "nil receiver returns empty slice", p: nil, want: []string{}},
		{name: "empty list returns empty slice", p: mustNewPS(t, true, []string{}), want: []string{}},
		{name: "populated list is returned", p: mustNewPS(t, true, []string{"https://x.com", "https://y.com"}), want: []string{"https://x.com", "https://y.com"}},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.p.AllowedOrigins())
		})
	}
}

func TestPostingSettings_Clone(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		p              *PostingSettings
		wantNil        bool
		wantEnabled    bool
		wantOrigins    []string
		mutateFn       func(c *PostingSettings)
		checkOriginals func(t *testing.T, original *PostingSettings)
	}{
		{
			name:    "nil returns nil",
			p:       nil,
			wantNil: true,
		},
		{
			name:        "clone copies enabled flag",
			p:           mustNewPS(t, true, nil),
			wantEnabled: true,
			wantOrigins: []string{},
		},
		{
			name:        "clone with empty origins produces empty slice",
			p:           mustNewPS(t, false, []string{}),
			wantEnabled: false,
			wantOrigins: []string{},
		},
		{
			name:        "clone copies allowedOrigins as distinct slice",
			p:           mustNewPS(t, true, []string{"https://a.com"}),
			wantEnabled: true,
			wantOrigins: []string{"https://a.com"},
			mutateFn:    func(c *PostingSettings) { c.allowedOrigins[0] = "https://mutated.com" },
			checkOriginals: func(t *testing.T, original *PostingSettings) {
				assert.Equal(t, "https://a.com", original.AllowedOrigins()[0], "mutating clone must not affect original")
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			c := tt.p.Clone()
			if tt.wantNil {
				assert.Nil(t, c)
				return
			}
			require.NotNil(t, c)
			assert.NotSame(t, tt.p, c)
			assert.Equal(t, tt.wantEnabled, c.Enabled())
			assert.Equal(t, tt.wantOrigins, c.AllowedOrigins())
			if tt.mutateFn != nil {
				tt.mutateFn(c)
			}
			if tt.checkOriginals != nil {
				tt.checkOriginals(t, tt.p)
			}
		})
	}
}

func TestPostingSettings_CheckOrigin(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		allowedOrigins []string
		origin         string
		wantErr        error
	}{
		{
			name:           "empty allowed list returns ErrNoOriginsConfigured",
			allowedOrigins: []string{},
			origin:         "https://example.com",
			wantErr:        ErrNoOriginsConfigured,
		},
		{
			name:           "absent origin returns ErrOriginNotAllowed",
			allowedOrigins: []string{"https://example.com"},
			origin:         "",
			wantErr:        ErrOriginNotAllowed,
		},
		{
			name:           "origin not in list returns ErrOriginNotAllowed",
			allowedOrigins: []string{"https://example.com"},
			origin:         "https://evil.com",
			wantErr:        ErrOriginNotAllowed,
		},
		{
			name:           "matching origin returns nil",
			allowedOrigins: []string{"https://example.com"},
			origin:         "https://example.com",
			wantErr:        nil,
		},
		{
			name:           "matching one of multiple origins returns nil",
			allowedOrigins: []string{"https://a.com", "https://b.com"},
			origin:         "https://b.com",
			wantErr:        nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ps := mustNewPS(t, true, tt.allowedOrigins)
			assert.ErrorIs(t, ps.CheckOrigin(tt.origin), tt.wantErr)
		})
	}
}

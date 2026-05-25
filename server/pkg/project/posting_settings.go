package project

import (
	"fmt"
	"net/url"
	"strings"
)

var ErrInvalidOrigin = fmt.Errorf("invalid origin: must be a valid http/https URL with no path, query, fragment, or wildcards")
var ErrNoOriginsConfigured = fmt.Errorf("no origins are configured for posting on this project")
var ErrOriginNotAllowed = fmt.Errorf("origin is not allowed for posting on this project")

type PostingSettings struct {
	enabled        bool
	allowedOrigins []string
}

func NewPostingSettings(enabled bool, allowedOrigins []string) *PostingSettings {
	var origins []string
	if allowedOrigins == nil {
		origins = []string{}
	} else {
		origins = make([]string, len(allowedOrigins))
		copy(origins, allowedOrigins)
	}
	return &PostingSettings{enabled: enabled, allowedOrigins: origins}
}

func (p *PostingSettings) Enabled() bool {
	if p == nil {
		return false
	}
	return p.enabled
}

func (p *PostingSettings) AllowedOrigins() []string {
	if p == nil {
		return []string{}
	}
	return p.allowedOrigins
}

func (p *PostingSettings) Clone() *PostingSettings {
	if p == nil {
		return nil
	}
	origins := make([]string, len(p.allowedOrigins))
	copy(origins, p.allowedOrigins)
	return &PostingSettings{enabled: p.enabled, allowedOrigins: origins}
}

// CheckOrigin validates the request origin against the allowedOrigins list.
// Returns nil on success, or an error:
//   - ErrNoOriginsConfigured when allowedOrigins is empty
//   - ErrOriginNotAllowed when origin is absent or not in the list
func (p *PostingSettings) CheckOrigin(origin string) error {
	if len(p.allowedOrigins) == 0 {
		return ErrNoOriginsConfigured
	}
	if origin == "" {
		return ErrOriginNotAllowed
	}
	for _, allowed := range p.allowedOrigins {
		if allowed == origin {
			return nil
		}
	}
	return ErrOriginNotAllowed
}

// ValidateOrigins checks that every entry in origins is a valid http/https URL
// with no wildcards, path, query string, or fragment.
func ValidateOrigins(origins []string) error {
	for _, o := range origins {
		if err := validateOrigin(o); err != nil {
			return err
		}
	}
	return nil
}

func validateOrigin(origin string) error {
	invalid := func() error { return fmt.Errorf("%w: %q", ErrInvalidOrigin, origin) }
	if strings.Contains(origin, "*") {
		return invalid()
	}
	u, err := url.Parse(origin)
	if err != nil {
		return invalid()
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return invalid()
	}
	if u.Host == "" {
		return invalid()
	}
	if (u.Path != "" && u.Path != "/") || u.RawQuery != "" || u.Fragment != "" {
		return invalid()
	}
	return nil
}

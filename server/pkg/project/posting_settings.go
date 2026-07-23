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

func NewPostingSettings(enabled bool, allowedOrigins []string) (*PostingSettings, error) {
	var origins []string
	if allowedOrigins == nil {
		origins = []string{}
	} else {
		origins = make([]string, len(allowedOrigins))
		for i, o := range allowedOrigins {
			origins[i] = strings.TrimSuffix(o, "/")
		}
	}
	if err := ValidateOrigins(origins); err != nil {
		return nil, err
	}
	return &PostingSettings{enabled: enabled, allowedOrigins: origins}, nil
}

func (p *PostingSettings) Enabled() bool {
	if p == nil {
		return true
	}
	return p.enabled
}

func (p *PostingSettings) AllowedOrigins() []string {
	if p == nil {
		return []string{}
	}
	origins := make([]string, len(p.allowedOrigins))
	copy(origins, p.allowedOrigins)
	return origins
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
func (p *PostingSettings) CheckOrigin(origin string) error {
	if p == nil || len(p.allowedOrigins) == 0 {
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
	u, err := url.Parse(origin)
	if err != nil ||
		strings.Contains(origin, "*") ||
		(u.Scheme != "http" && u.Scheme != "https") ||
		u.Host == "" ||
		(u.Path != "" && u.Path != "/") ||
		u.RawQuery != "" ||
		u.Fragment != "" {
		return fmt.Errorf("%w: %q", ErrInvalidOrigin, origin)
	}
	return nil
}

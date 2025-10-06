package types

import "time"

type Asset struct {
	Type        string     `json:"type"`
	ID          string     `json:"id,omitempty"`
	URL         string     `json:"url,omitempty"`
	ContentType string     `json:"contentType,omitempty"`
	Size        int64      `json:"size,omitempty"`
	Files       []string   `json:"files,omitempty"`
	CreatedAt   *time.Time `json:"createdAt,omitempty"`
}

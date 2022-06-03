// Package file provides convenient helpers for files and abstractions of files
package file

import (
	"io"
)

// File abstracts an abstract file
type File struct {
	Content io.ReadCloser
	Path    string
	Size    int64
	// If the content type is not explicitly specified, ContenType will be an empty string.
	ContentType string
}

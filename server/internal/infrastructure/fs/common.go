package fs

import "errors"

const (
	fileSizeLimit int64 = 10 * 1024 * 1024 * 1024 // 10GB
	assetDir            = "assets"
	defaultBase         = "http://localhost:8080/assets"
)

var (
	ErrInvalidBaseURL = errors.New("invalid base URL")
)

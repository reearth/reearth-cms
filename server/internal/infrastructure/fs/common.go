package fs

import "errors"

const (
	assetDir            = "assets"
	fileSizeLimit int64 = 1024 * 1024 * 100 // about 100MB
)

var (
	invalidBaseURLErr = errors.New("invalid base URL")
)

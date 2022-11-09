package fs

import "errors"

const (
	assetDir            = "assets"
	fileSizeLimit int64 = 1024 * 1024 * 1024 // about 1GB
)

var (
	invalidBaseURLErr = errors.New("invalid base URL")
)

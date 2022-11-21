package fs

import "errors"

const (
	assetDir            = "assets"
	fileSizeLimit int64 = 10 * 1024 * 1024 * 1024 // 10GB
)

var (
	invalidBaseURLErr = errors.New("invalid base URL")
)

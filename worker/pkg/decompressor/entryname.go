package decompressor

import (
	"errors"
	"fmt"
	"strings"
)

// ErrUnsafeEntryName is returned when an archive entry name could make the
// extracted file land outside the asset's own directory (Zip Slip).
var ErrUnsafeEntryName = errors.New("unsafe archive entry name")

// ValidateEntryName rejects archive entry names that are not plain relative
// paths: empty names, absolute paths (including Windows drive letters),
// backslashes, NUL bytes, and any ".." segment. Directory entries (with a
// trailing "/") are validated the same way.
func ValidateEntryName(name string) error {
	if reason := unsafeEntryReason(name); reason != "" {
		return fmt.Errorf("%w: %q: %s", ErrUnsafeEntryName, name, reason)
	}
	return nil
}

func unsafeEntryReason(name string) string {
	isDir := strings.HasSuffix(name, "/")
	n := strings.TrimSuffix(name, "/")
	switch {
	case n == "":
		return "empty name"
	case strings.ContainsRune(n, 0):
		return "contains a NUL byte"
	case strings.Contains(n, `\`):
		return "contains a backslash"
	case strings.HasPrefix(n, "/"):
		return "absolute path"
	case hasDriveLetter(n):
		return "absolute Windows path"
	}
	for _, seg := range strings.Split(n, "/") {
		if seg == ".." {
			return `contains a ".." segment`
		}
	}
	if n == "." && !isDir {
		return "not a file name"
	}
	return ""
}

func hasDriveLetter(n string) bool {
	if len(n) < 2 || n[1] != ':' {
		return false
	}
	c := n[0]
	return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')
}

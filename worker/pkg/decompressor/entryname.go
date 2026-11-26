package decompressor

import (
	"errors"
	"fmt"
	"strings"
)

// ErrUnsafeEntryName is returned when an archive entry name could make the
// extracted file land outside the asset's own directory (Zip Slip).
var ErrUnsafeEntryName = errors.New("unsafe archive entry name")

// NormalizeEntryName turns an archive entry name into a relative path, the
// way unzip and 7-Zip do when extracting:
//   - backslashes become "/" (older Windows tools, e.g. PowerShell
//     Compress-Archive, use "\" as the separator), so "..\" is seen as "../";
//   - a leading drive letter ("C:") and leading "/" are removed, so an entry
//     stored with an absolute path is extracted inside the asset.
//
// It reports whether an absolute prefix was removed. ".." is not resolved
// here: ValidateEntryName rejects it.
func NormalizeEntryName(name string) (string, bool) {
	n := strings.ReplaceAll(name, `\`, "/")
	stripped := false
	if hasDriveLetter(n) {
		n = n[2:]
		stripped = true
	}
	if t := strings.TrimLeft(n, "/"); t != n {
		n = t
		stripped = true
	}
	return n, stripped
}

// ValidateEntryName normalizes name (see NormalizeEntryName) and rejects it
// if it is empty, contains a NUL byte, or has any ".." segment.
func ValidateEntryName(name string) error {
	if reason := unsafeEntryReason(name); reason != "" {
		return fmt.Errorf("%w: %q: %s", ErrUnsafeEntryName, name, reason)
	}
	return nil
}

func unsafeEntryReason(name string) string {
	norm, _ := NormalizeEntryName(name)
	isDir := strings.HasSuffix(norm, "/")
	n := strings.TrimSuffix(norm, "/")
	switch {
	case n == "":
		return "empty name"
	case strings.ContainsRune(n, 0):
		return "contains a NUL byte"
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

// isDirEntry reports whether an entry is a directory (trailing "/" or "\").
// Directory entries are never written.
func isDirEntry(name string) bool {
	return strings.HasSuffix(name, "/") || strings.HasSuffix(name, `\`)
}

// normalizedFile is an archive entry whose name has been normalized.
type normalizedFile struct {
	File
	name string
}

func (f normalizedFile) Name() string { return f.name }

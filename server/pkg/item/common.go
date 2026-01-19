package item

import "golang.org/x/text/unicode/norm"

func NormalizeFileName(name string) string {
	return norm.NFKC.String(name)
}
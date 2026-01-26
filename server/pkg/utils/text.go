package utils

import "golang.org/x/text/unicode/norm"

func NormalizeText(s string) string {
	return norm.NFKC.String(s)
}

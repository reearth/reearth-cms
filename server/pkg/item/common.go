package item

import "golang.org/x/text/unicode/norm"

func NormalizeText(name string) string {
	return norm.NFKC.String(name)
}
package utils

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
	"golang.org/x/text/unicode/norm"
)

func NormalizeText(s string) string {
	return norm.NFKC.String(s)
}


func NormalizeStringValues(fieldType string, values []any) []any {
	if !value.IsString(fieldType) {
		return values
	}

	normalized := make([]any, len(values))
	for i, val := range values {
		if str, ok := val.(string); ok {
			normalized[i] = NormalizeText(str)
		} else {
			normalized[i] = val
		}
	}
	return normalized
}

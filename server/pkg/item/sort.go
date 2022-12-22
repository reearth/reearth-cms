package item

import (
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/sort"
)

type Sort struct {
	Direction sort.Direction
	SortBy    SortType
}
type SortType string

var (
	SortTypeDate SortType = "date"
)

func SortTypeFrom(s string) SortType {
	ss := strings.ToLower(s)
	switch ss {
	case "date":
		return SortTypeDate
	default:
		return ""
	}
}

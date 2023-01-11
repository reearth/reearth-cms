package item

import (
	"strings"
)

type Sort struct {
	Direction Direction
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

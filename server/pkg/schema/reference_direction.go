package schema

import "strings"

type ReferenceDirection string

const (
	ReferenceDirectionOneWay ReferenceDirection = "one_way"
	ReferenceDirectionTwoWay ReferenceDirection = "two_way"
)

func ReferenceDirectionFrom(p string) (ReferenceDirection, bool) {
	pp := strings.ToLower(p)
	switch ReferenceDirection(pp) {
	case ReferenceDirectionOneWay:
		return ReferenceDirectionOneWay, true
	case ReferenceDirectionTwoWay:
		return ReferenceDirectionTwoWay, true
	default:
		return ReferenceDirection(""), false
	}
}

func (d ReferenceDirection) String() string {
	return string(d)
}

func (d ReferenceDirection) ToPtr() *ReferenceDirection {
	return &d
}

package value

import (
	"strings"

	"github.com/reearth/reearthx/util"
)

const TypeTag Type = "tag"

type TagValue = []string

type tag struct{}

func (a *tag) New(v any) (any, error) {
	switch w := v.(type) {
	case []string:
		return w, nil
	case string:
		return util.Map(strings.Split(w, ","), strings.TrimSpace), nil
	}
	return nil, ErrInvalidValue
}

func (v *Value) ValueTag() (r TagValue) {
	v.Match(Match{
		Tag: func(v TagValue) {
			r = v
		},
	})
	return
}

package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldDateTime struct {
	isTimeRange bool
}

func NewDateTime(tr bool) *FieldDateTime {
	return &FieldDateTime{
		isTimeRange: tr,
	}
}

func (f *FieldDateTime) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:        f.Type(),
		dateTime: f,
	}
}

func (f *FieldDateTime) IsTimeRange() bool {
	return f.isTimeRange
}

func (f *FieldDateTime) Type() value.Type {
	return value.TypeDateTime
}

func (f *FieldDateTime) Clone() *FieldDateTime {
	if f == nil {
		return nil
	}
	return &FieldDateTime{}
}

func (f *FieldDateTime) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		DateTime: func(a value.DateTime) {
			if len(a) > 2 {
				err = ErrInvalidValue
			}
			if f.isTimeRange && (len(a) != 2 || a[0].After(a[1])) {
				err = ErrInvalidValue
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

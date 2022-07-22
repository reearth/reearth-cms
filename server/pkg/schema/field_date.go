package schema

import (
	"time"
)

var TypeDate Type = "date"

type FieldDate struct {
	defaultValue *time.Time
}

func NewFieldDate() *FieldDate {
	return &FieldDate{
		defaultValue: nil,
	}
}

func FieldDateFrom(t *time.Time) *FieldDate {
	return &FieldDate{
		defaultValue: t,
	}
}

func (f *FieldDate) TypeProperty() *TypeProperty {
	return &TypeProperty{
		date: f,
	}
}

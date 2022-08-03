package schema

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestFieldDateFrom(t *testing.T) {
	now := time.Now()
	tests := []struct {
		name string
		arg  *time.Time
		want *FieldDate
	}{
		{
			name: "success default nil",
			arg:  nil,
			want: &FieldDate{defaultValue: nil},
		},
		{
			name: "success default value",
			arg:  &now,
			want: &FieldDate{defaultValue: &now},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, FieldDateFrom(tc.arg))
		})
	}
}

func TestFieldDate_TypeProperty(t *testing.T) {
	now := time.Now()
	tests := []struct {
		name string
		f    *FieldDate
		want *TypeProperty
	}{
		{
			name: "nil",
			f:    nil,
			want: &TypeProperty{},
		},
		{
			name: "success default nil",
			f:    &FieldDate{defaultValue: nil},
			want: &TypeProperty{date: &FieldDate{defaultValue: nil}},
		},
		{
			name: "success default value",
			f:    &FieldDate{defaultValue: &now},
			want: &TypeProperty{date: &FieldDate{defaultValue: &now}},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.f.TypeProperty())
		})
	}
}

func TestNewFieldDate(t *testing.T) {
	tests := []struct {
		name string
		want *FieldDate
	}{
		{
			name: "new",
			want: &FieldDate{
				defaultValue: nil,
			},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, newFieldDate())
		})
	}
}

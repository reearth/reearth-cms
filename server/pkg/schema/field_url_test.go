package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldURLFrom(t *testing.T) {
	type args struct {
		defaultValue *string
	}
	tests := []struct {
		name string
		args args
		want *FieldURL
	}{
		{
			name: "success default nil",
			args: args{},
			want: &FieldURL{defaultValue: nil},
		},
		{
			name: "success default value",
			args: args{defaultValue: lo.ToPtr("hugo.com")},
			want: &FieldURL{defaultValue: lo.ToPtr("hugo.com")},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, FieldURLFrom(tc.args.defaultValue))
		})
	}
}

func TestFieldURL_TypeProperty(t *testing.T) {

	tests := []struct {
		name string
		f    *FieldURL
		want *TypeProperty
	}{
		{
			name: "nil",
			f:    nil,
			want: &TypeProperty{},
		},
		{
			name: "success default nil",
			f:    &FieldURL{defaultValue: nil},
			want: &TypeProperty{url: &FieldURL{defaultValue: nil}},
		},
		{
			name: "success default value",
			f:    &FieldURL{defaultValue: lo.ToPtr("hugo.com")},
			want: &TypeProperty{url: &FieldURL{defaultValue: lo.ToPtr("hugo.com")}},
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

func TestNewFieldURL(t *testing.T) {
	tests := []struct {
		name string
		want *FieldURL
	}{
		{
			name: "new",
			want: &FieldURL{
				defaultValue: nil,
			},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, NewFieldURL())
		})
	}
}

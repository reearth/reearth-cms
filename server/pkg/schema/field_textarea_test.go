package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldTextAreaFrom(t *testing.T) {
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name string
		args args
		want *FieldTextArea
	}{
		{
			name: "success default nil",
			args: args{},
			want: &FieldTextArea{defaultValue: nil, maxLength: nil},
		},
		{
			name: "success default value",
			args: args{defaultValue: lo.ToPtr("test")},
			want: &FieldTextArea{defaultValue: lo.ToPtr("test")},
		},
		{
			name: "success max length",
			args: args{maxLength: lo.ToPtr(256)},
			want: &FieldTextArea{maxLength: lo.ToPtr(256)},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, FieldTextAreaFrom(tc.args.defaultValue, tc.args.maxLength))
		})
	}
}

func TestFieldTextArea_TypeProperty(t *testing.T) {

	tests := []struct {
		name string
		f    *FieldTextArea
		want *TypeProperty
	}{
		{
			name: "nil",
			f:    nil,
			want: &TypeProperty{},
		},
		{
			name: "success default nil",
			f:    &FieldTextArea{defaultValue: nil},
			want: &TypeProperty{textArea: &FieldTextArea{defaultValue: nil}},
		},
		{
			name: "success default value",
			f:    &FieldTextArea{defaultValue: lo.ToPtr("test")},
			want: &TypeProperty{textArea: &FieldTextArea{defaultValue: lo.ToPtr("test")}},
		},
		{
			name: "success max length",
			f:    &FieldTextArea{maxLength: lo.ToPtr(256)},
			want: &TypeProperty{textArea: &FieldTextArea{maxLength: lo.ToPtr(256)}},
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

func TestNewFieldTextArea(t *testing.T) {
	tests := []struct {
		name string
		want *FieldTextArea
	}{
		{
			name: "new",
			want: &FieldTextArea{
				defaultValue: nil,
				maxLength:    nil,
			},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, newFieldTextArea())
		})
	}
}

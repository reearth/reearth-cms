package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldMarkdownFrom(t *testing.T) {
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name string
		args args
		want *FieldMarkdown
	}{
		{
			name: "success default nil",
			args: args{},
			want: &FieldMarkdown{defaultValue: nil, maxLength: nil},
		},
		{
			name: "success default value",
			args: args{defaultValue: lo.ToPtr("test")},
			want: &FieldMarkdown{defaultValue: lo.ToPtr("test")},
		},
		{
			name: "success max length",
			args: args{maxLength: lo.ToPtr(256)},
			want: &FieldMarkdown{maxLength: lo.ToPtr(256)},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, FieldMarkdownFrom(tc.args.defaultValue, tc.args.maxLength))
		})
	}
}

func TestFieldMarkdown_TypeProperty(t *testing.T) {

	tests := []struct {
		name string
		f    *FieldMarkdown
		want *TypeProperty
	}{
		{
			name: "nil",
			f:    nil,
			want: &TypeProperty{},
		},
		{
			name: "success default nil",
			f:    &FieldMarkdown{defaultValue: nil},
			want: &TypeProperty{markdown: &FieldMarkdown{defaultValue: nil}},
		},
		{
			name: "success default value",
			f:    &FieldMarkdown{defaultValue: lo.ToPtr("test")},
			want: &TypeProperty{markdown: &FieldMarkdown{defaultValue: lo.ToPtr("test")}},
		},
		{
			name: "success max length",
			f:    &FieldMarkdown{maxLength: lo.ToPtr(256)},
			want: &TypeProperty{markdown: &FieldMarkdown{maxLength: lo.ToPtr(256)}},
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

func TestNewFieldMarkdown(t *testing.T) {
	tests := []struct {
		name string
		want *FieldMarkdown
	}{
		{
			name: "new",
			want: &FieldMarkdown{
				defaultValue: nil,
				maxLength:    nil,
			},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, newFieldMarkdown())
		})
	}
}

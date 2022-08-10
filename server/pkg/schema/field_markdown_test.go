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

func TestFieldMarkdown_DefaultValue(t *testing.T) {
	type fields struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name   string
		fields fields
		want   *string
	}{
		{
			name: "test nil",
			fields: fields{
				defaultValue: nil,
				maxLength:    nil,
			},
			want: nil,
		},
		{
			name: "test",
			fields: fields{
				defaultValue: lo.ToPtr("test"),
				maxLength:    nil,
			},
			want: lo.ToPtr("test"),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			f := &FieldMarkdown{
				defaultValue: tt.fields.defaultValue,
				maxLength:    tt.fields.maxLength,
			}
			assert.Equalf(t, tt.want, f.DefaultValue(), "DefaultValue()")
		})
	}
}

func TestFieldMarkdown_MaxLength(t *testing.T) {
	type fields struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name   string
		fields fields
		want   *int
	}{
		{
			name: "test nil",
			fields: fields{
				defaultValue: nil,
				maxLength:    nil,
			},
			want: nil,
		},
		{
			name: "test",
			fields: fields{
				defaultValue: nil,
				maxLength:    lo.ToPtr(123),
			},
			want: lo.ToPtr(123),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			f := &FieldMarkdown{
				defaultValue: tt.fields.defaultValue,
				maxLength:    tt.fields.maxLength,
			}
			assert.Equalf(t, tt.want, f.MaxLength(), "MaxLength()")
		})
	}
}

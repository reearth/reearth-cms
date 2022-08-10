package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldRichTextFrom(t *testing.T) {
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name string
		args args
		want *FieldRichText
	}{
		{
			name: "success default nil",
			args: args{},
			want: &FieldRichText{defaultValue: nil, maxLength: nil},
		},
		{
			name: "success default value",
			args: args{defaultValue: lo.ToPtr("test")},
			want: &FieldRichText{defaultValue: lo.ToPtr("test")},
		},
		{
			name: "success max length",
			args: args{maxLength: lo.ToPtr(256)},
			want: &FieldRichText{maxLength: lo.ToPtr(256)},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, FieldRichTextFrom(tc.args.defaultValue, tc.args.maxLength))
		})
	}
}

func TestFieldRichText_TypeProperty(t *testing.T) {

	tests := []struct {
		name string
		f    *FieldRichText
		want *TypeProperty
	}{
		{
			name: "nil",
			f:    nil,
			want: &TypeProperty{},
		},
		{
			name: "success default nil",
			f:    &FieldRichText{defaultValue: nil},
			want: &TypeProperty{richText: &FieldRichText{defaultValue: nil}},
		},
		{
			name: "success default value",
			f:    &FieldRichText{defaultValue: lo.ToPtr("test")},
			want: &TypeProperty{richText: &FieldRichText{defaultValue: lo.ToPtr("test")}},
		},
		{
			name: "success max length",
			f:    &FieldRichText{maxLength: lo.ToPtr(256)},
			want: &TypeProperty{richText: &FieldRichText{maxLength: lo.ToPtr(256)}},
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

func TestFieldRichText_DefaultValue(t *testing.T) {
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
				defaultValue: lo.ToPtr("v"),
			},
			want: lo.ToPtr("v"),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			f := &FieldRichText{
				defaultValue: tt.fields.defaultValue,
				maxLength:    tt.fields.maxLength,
			}
			assert.Equalf(t, tt.want, f.DefaultValue(), "DefaultValue()")
		})
	}
}

func TestFieldRichText_MaxLength(t *testing.T) {
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

			f := &FieldRichText{
				defaultValue: tt.fields.defaultValue,
				maxLength:    tt.fields.maxLength,
			}
			assert.Equalf(t, tt.want, f.MaxLength(), "MaxLength()")
		})
	}
}

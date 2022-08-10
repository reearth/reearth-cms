package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldTextFrom(t *testing.T) {
	type args struct {
		defaultValue *string
		maxLength    *int
	}
	tests := []struct {
		name string
		args args
		want *FieldText
	}{
		{
			name: "success default nil",
			args: args{},
			want: &FieldText{defaultValue: nil, maxLength: nil},
		},
		{
			name: "success default value",
			args: args{defaultValue: lo.ToPtr("test")},
			want: &FieldText{defaultValue: lo.ToPtr("test")},
		},
		{
			name: "success max length",
			args: args{maxLength: lo.ToPtr(256)},
			want: &FieldText{maxLength: lo.ToPtr(256)},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, FieldTextFrom(tc.args.defaultValue, tc.args.maxLength))
		})
	}
}

func TestFieldText_TypeProperty(t *testing.T) {

	tests := []struct {
		name string
		f    *FieldText
		want *TypeProperty
	}{
		{
			name: "nil",
			f:    nil,
			want: &TypeProperty{},
		},
		{
			name: "success default nil",
			f:    &FieldText{defaultValue: nil},
			want: &TypeProperty{text: &FieldText{defaultValue: nil}},
		},
		{
			name: "success default value",
			f:    &FieldText{defaultValue: lo.ToPtr("test")},
			want: &TypeProperty{text: &FieldText{defaultValue: lo.ToPtr("test")}},
		},
		{
			name: "success max length",
			f:    &FieldText{maxLength: lo.ToPtr(256)},
			want: &TypeProperty{text: &FieldText{maxLength: lo.ToPtr(256)}},
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

func TestFieldText_DefaultValue(t *testing.T) {
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

			f := &FieldText{
				defaultValue: tt.fields.defaultValue,
				maxLength:    tt.fields.maxLength,
			}
			assert.Equal(t, tt.want, f.DefaultValue())
		})
	}
}

func TestFieldText_MaxLength(t *testing.T) {
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

			f := &FieldText{
				defaultValue: tt.fields.defaultValue,
				maxLength:    tt.fields.maxLength,
			}
			assert.Equal(t, tt.want, f.MaxLength())
		})
	}
}

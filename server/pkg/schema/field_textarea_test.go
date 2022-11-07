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
		name   string
		args   args
		want   *FieldTextArea
		wanErr bool
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
		{
			name:   "fail:default > max length",
			args:   args{defaultValue: lo.ToPtr("xxxxxx"), maxLength: lo.ToPtr(5)},
			wanErr: true,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			res, err := FieldTextAreaFrom(tc.args.defaultValue, tc.args.maxLength)
			if tc.wanErr {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tc.want, res)
			}
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

func TestFieldTextArea_DefaultValue(t *testing.T) {
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

			f := &FieldTextArea{
				defaultValue: tt.fields.defaultValue,
				maxLength:    tt.fields.maxLength,
			}
			assert.Equal(t, tt.want, f.DefaultValue())
		})
	}
}

func TestFieldTextArea_MaxLength(t *testing.T) {
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

			f := &FieldTextArea{
				defaultValue: tt.fields.defaultValue,
				maxLength:    tt.fields.maxLength,
			}
			assert.Equal(t, tt.want, f.MaxLength())
		})
	}
}

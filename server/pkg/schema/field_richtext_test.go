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

/*func TestNewFieldRichText(t *testing.T) {
	tests := []struct {
		name string
		want *FieldRichText
	}{
		{
			name: "new",
			want: &FieldRichText{
				defaultValue: nil,
				maxLength:    nil,
			},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, newFieldRichText())
		})
	}
}*/

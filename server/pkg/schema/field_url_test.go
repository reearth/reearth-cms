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
		name    string
		args    args
		want    *FieldURL
		wantErr error
	}{
		{
			name: "success default nil",
			args: args{},
			want: &FieldURL{defaultValue: nil},
		},
		{
			name: "success default value",
			args: args{defaultValue: lo.ToPtr("https://hugo.com")},
			want: &FieldURL{defaultValue: lo.ToPtr("https://hugo.com")},
		},
		{
			name:    "success default value",
			args:    args{defaultValue: lo.ToPtr("123")},
			want:    nil,
			wantErr: ErrFieldDefaultValue,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			tp, err := FieldURLFrom(tc.args.defaultValue)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.Equal(t, tc.want, tp)
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

func TestMustFieldURLFrom(t *testing.T) {
	type args struct {
		defaultValue *string
	}
	tests := []struct {
		name    string
		args    args
		want    *FieldURL
		wantErr error
	}{
		{
			name: "success default nil",
			args: args{},
			want: &FieldURL{defaultValue: nil},
		},
		{
			name: "success default value",
			args: args{defaultValue: lo.ToPtr("https://hugo.com")},
			want: &FieldURL{defaultValue: lo.ToPtr("https://hugo.com")},
		},
		{
			name:    "success default value",
			args:    args{defaultValue: lo.ToPtr("123")},
			want:    nil,
			wantErr: ErrFieldDefaultValue,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			if tc.wantErr != nil {
				assert.PanicsWithValue(t, tc.wantErr, func() {
					MustFieldURLFrom(tc.args.defaultValue)
				})
				return
			}
			assert.Equal(t, tc.want, MustFieldURLFrom(tc.args.defaultValue))
		})
	}
}

func TestFieldURL_DefaultValue(t *testing.T) {
	type fields struct {
		defaultValue *string
	}
	tests := []struct {
		name   string
		fields fields
		want   *string
	}{
		{
			name: "test",
			fields: fields{
				defaultValue: nil,
			},
			want: nil,
		},
		{
			name: "test",
			fields: fields{
				defaultValue: lo.ToPtr("test"),
			},
			want: lo.ToPtr("test"),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			f := &FieldURL{
				defaultValue: tt.fields.defaultValue,
			}
			assert.Equal(t, tt.want, f.DefaultValue())
		})
	}
}

package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldSelectFrom(t *testing.T) {
	type args struct {
		defaultValue *int
		values       []string
	}
	tests := []struct {
		name    string
		args    args
		want    *FieldSelect
		wantErr error
	}{
		{
			name:    "success values",
			args:    args{values: []string{"v1", "v2"}},
			want:    &FieldSelect{values: []string{"v1", "v2"}},
			wantErr: nil,
		},
		{
			name:    "success values and default value",
			args:    args{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr(0)},
			want:    &FieldSelect{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr(0)},
			wantErr: nil,
		},
		{
			name:    "fail no values",
			args:    args{},
			want:    nil,
			wantErr: ErrFieldValues,
		},
		{
			name:    "fail no values",
			args:    args{defaultValue: lo.ToPtr(0)},
			want:    nil,
			wantErr: ErrFieldValues,
		},
		{
			name:    "fail values and default value",
			args:    args{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr(3)},
			want:    nil,
			wantErr: ErrFieldDefaultValue,
		},
		{
			name:    "fail values and default value",
			args:    args{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr(-1)},
			want:    nil,
			wantErr: ErrFieldDefaultValue,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got, err := FieldSelectFrom(tc.args.values, tc.args.defaultValue)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				assert.Nil(t, got)
				return
			}
			assert.Nil(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestMustFieldSelectFrom(t *testing.T) {
	type args struct {
		defaultValue *int
		values       []string
	}
	tests := []struct {
		name    string
		args    args
		want    *FieldSelect
		wantErr error
	}{
		{
			name:    "success values",
			args:    args{values: []string{"v1", "v2"}},
			want:    &FieldSelect{values: []string{"v1", "v2"}},
			wantErr: nil,
		},
		{
			name:    "success values and default value",
			args:    args{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr(0)},
			want:    &FieldSelect{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr(0)},
			wantErr: nil,
		},
		{
			name:    "fail no values",
			args:    args{},
			want:    nil,
			wantErr: ErrFieldValues,
		},
		{
			name:    "fail no values",
			args:    args{defaultValue: lo.ToPtr(0)},
			want:    nil,
			wantErr: ErrFieldValues,
		},
		{
			name:    "fail values and default value",
			args:    args{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr(3)},
			want:    nil,
			wantErr: ErrFieldDefaultValue,
		},
		{
			name:    "fail values and default value",
			args:    args{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr(-1)},
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
					_ = MustFieldSelectFrom(tc.args.values, tc.args.defaultValue)
				})
				return
			}
			assert.Equal(t, tc.want, MustFieldSelectFrom(tc.args.values, tc.args.defaultValue))
		})
	}
}

func TestFieldSelect_TypeProperty(t *testing.T) {

	tests := []struct {
		name string
		f    *FieldSelect
		want *TypeProperty
	}{
		{
			name: "nil",
			f:    nil,
			want: &TypeProperty{},
		},
		{
			name: "success default nil",
			f:    &FieldSelect{defaultValue: nil},
			want: &TypeProperty{selectt: &FieldSelect{defaultValue: nil}},
		},
		{
			name: "success values",
			f:    &FieldSelect{values: []string{"V1", "v2"}},
			want: &TypeProperty{selectt: &FieldSelect{values: []string{"V1", "v2"}}},
		},
		{
			name: "success default value",
			f:    &FieldSelect{defaultValue: lo.ToPtr(1)},
			want: &TypeProperty{selectt: &FieldSelect{defaultValue: lo.ToPtr(1)}},
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

func TestNewFieldSelect(t *testing.T) {
	tests := []struct {
		name string
		want *FieldSelect
	}{
		{
			name: "new",
			want: &FieldSelect{
				defaultValue: nil,
				values:       nil,
			},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, NewFieldSelect())
		})
	}
}

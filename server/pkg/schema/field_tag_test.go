package schema

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFieldTagFrom(t *testing.T) {
	type args struct {
		values       []string
		defaultValue []string
	}
	tests := []struct {
		name    string
		args    args
		want    *FieldTag
		wantErr error
	}{
		{
			name:    "success values",
			args:    args{values: []string{"t1", "t2"}},
			want:    &FieldTag{values: []string{"t1", "t2"}},
			wantErr: nil,
		},
		{
			name:    "success values and default value",
			args:    args{values: []string{"t1", "t2"}, defaultValue: []string{"t1"}},
			want:    &FieldTag{values: []string{"t1", "t2"}, defaultValue: []string{"t1"}},
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
			args:    args{defaultValue: []string{"t1"}},
			want:    nil,
			wantErr: ErrFieldValues,
		},
		{
			name:    "fail no values",
			args:    args{values: []string{"t1", "t2"}, defaultValue: []string{"t3"}},
			want:    nil,
			wantErr: ErrFieldDefaultValue,
		},
		{
			name:    "fail no values",
			args:    args{values: []string{"t1", "t2"}, defaultValue: []string{"t2", "t3"}},
			want:    nil,
			wantErr: ErrFieldDefaultValue,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got, err := FieldTagFrom(tc.args.values, tc.args.defaultValue)
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

func TestMustFieldTagFrom(t *testing.T) {
	type args struct {
		values       []string
		defaultValue []string
	}
	tests := []struct {
		name    string
		args    args
		want    *FieldTag
		wantErr error
	}{
		{
			name:    "success values",
			args:    args{values: []string{"t1", "t2"}},
			want:    &FieldTag{values: []string{"t1", "t2"}},
			wantErr: nil,
		},
		{
			name:    "success values and default value",
			args:    args{values: []string{"t1", "t2"}, defaultValue: []string{"t1"}},
			want:    &FieldTag{values: []string{"t1", "t2"}, defaultValue: []string{"t1"}},
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
			args:    args{defaultValue: []string{"t0"}},
			want:    nil,
			wantErr: ErrFieldValues,
		},
		{
			name:    "fail with default values",
			args:    args{values: []string{"t1", "t2"}, defaultValue: []string{"t3"}},
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
					_ = MustFieldTagFrom(tc.args.values, tc.args.defaultValue)
				})
				return
			}
			assert.Equal(t, tc.want, MustFieldTagFrom(tc.args.values, tc.args.defaultValue))
		})
	}
}

func TestFieldTag_TypeProperty(t *testing.T) {

	tests := []struct {
		name string
		f    *FieldTag
		want *TypeProperty
	}{
		{
			name: "nil",
			f:    nil,
			want: &TypeProperty{},
		},
		{
			name: "success default nil",
			f:    &FieldTag{defaultValue: nil},
			want: &TypeProperty{tag: &FieldTag{defaultValue: nil}},
		},
		{
			name: "success values",
			f:    &FieldTag{values: []string{"V1", "v2"}},
			want: &TypeProperty{tag: &FieldTag{values: []string{"V1", "v2"}}},
		},
		{
			name: "success default value",
			f:    &FieldTag{defaultValue: []string{"t1"}},
			want: &TypeProperty{tag: &FieldTag{defaultValue: []string{"t1"}}},
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

package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldTagFrom(t *testing.T) {
	type args struct {
		defaultValue *string
		values       []string
	}
	tests := []struct {
		name    string
		args    args
		want    *FieldTag
		wantErr error
	}{
		{
			name:    "success values",
			args:    args{values: []string{"v1", "v2"}},
			want:    &FieldTag{values: []string{"v1", "v2"}},
			wantErr: nil,
		},
		{
			name:    "success values and default value",
			args:    args{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr("t1")},
			want:    &FieldTag{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr("t1")},
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
			args:    args{defaultValue: lo.ToPtr("t1")},
			want:    nil,
			wantErr: ErrFieldValues,
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
		defaultValue *string
		values       []string
	}
	tests := []struct {
		name    string
		args    args
		want    *FieldTag
		wantErr error
	}{
		{
			name:    "success values",
			args:    args{values: []string{"v1", "v2"}},
			want:    &FieldTag{values: []string{"v1", "v2"}},
			wantErr: nil,
		},
		{
			name:    "success values and default value",
			args:    args{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr("t0")},
			want:    &FieldTag{values: []string{"v1", "v2"}, defaultValue: lo.ToPtr("t0")},
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
			args:    args{defaultValue: lo.ToPtr("t0")},
			want:    nil,
			wantErr: ErrFieldValues,
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
			f:    &FieldTag{defaultValue: lo.ToPtr("t1")},
			want: &TypeProperty{tag: &FieldTag{defaultValue: lo.ToPtr("t1")}},
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

func TestNewFieldTag(t *testing.T) {
	tests := []struct {
		name string
		want *FieldTag
	}{
		{
			name: "new",
			want: &FieldTag{
				defaultValue: nil,
				values:       nil,
			},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, NewFieldTag())
		})
	}
}

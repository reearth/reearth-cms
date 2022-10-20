package schema

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFieldIntegerFrom(t *testing.T) {
	type args struct {
		defaultValue *int
		min          *int
		max          *int
	}
	tests := []struct {
		name    string
		arg     args
		want    *FieldInteger
		wantErr error
	}{
		{
			name:    "success default nil",
			arg:     args{},
			want:    &FieldInteger{defaultValue: nil, min: nil, max: nil},
			wantErr: nil,
		},
		{
			name:    "success default value, min, max",
			arg:     args{defaultValue: lo.ToPtr(5), min: lo.ToPtr(0), max: lo.ToPtr(10)},
			want:    &FieldInteger{defaultValue: lo.ToPtr(5), min: lo.ToPtr(0), max: lo.ToPtr(10)},
			wantErr: nil,
		},
		{
			name: "success default value",
			arg:  args{defaultValue: lo.ToPtr(5)},
			want: &FieldInteger{defaultValue: lo.ToPtr(5), min: nil, max: nil},
		},
		{
			name:    "success min",
			arg:     args{min: lo.ToPtr(0)},
			want:    &FieldInteger{defaultValue: nil, min: lo.ToPtr(0), max: nil},
			wantErr: nil,
		},
		{
			name:    "success max",
			arg:     args{max: lo.ToPtr(10)},
			want:    &FieldInteger{defaultValue: nil, min: nil, max: lo.ToPtr(10)},
			wantErr: nil,
		},
		{
			name:    "fail 1",
			arg:     args{min: lo.ToPtr(20), max: lo.ToPtr(10)},
			want:    nil,
			wantErr: ErrMinMaxInvalid,
		},
		{
			name:    "fail 2",
			arg:     args{defaultValue: lo.ToPtr(5), min: lo.ToPtr(20)},
			want:    nil,
			wantErr: ErrMinDefaultInvalid,
		},
		{
			name:    "fail 3",
			arg:     args{defaultValue: lo.ToPtr(50), max: lo.ToPtr(10)},
			want:    nil,
			wantErr: ErrMaxDefaultInvalid,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got, err := FieldIntegerFrom(tc.arg.defaultValue, tc.arg.min, tc.arg.max)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				assert.Nil(t, got)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestMustFieldIntegerFrom(t *testing.T) {
	type args struct {
		defaultValue *int
		min          *int
		max          *int
	}
	tests := []struct {
		name    string
		arg     args
		want    *FieldInteger
		wantErr error
	}{
		{
			name:    "success",
			arg:     args{},
			want:    &FieldInteger{defaultValue: nil, min: nil, max: nil},
			wantErr: nil,
		},
		{
			name:    "fail",
			arg:     args{min: lo.ToPtr(20), max: lo.ToPtr(10)},
			want:    nil,
			wantErr: ErrMinMaxInvalid,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			if tc.wantErr != nil {
				assert.PanicsWithValue(t, tc.wantErr, func() {
					_ = MustFieldIntegerFrom(tc.arg.defaultValue, tc.arg.min, tc.arg.max)
				})
			} else {
				assert.Equal(t, tc.want, MustFieldIntegerFrom(tc.arg.defaultValue, tc.arg.min, tc.arg.max))
			}
		})
	}
}

func TestFieldInteger_TypeProperty(t *testing.T) {

	tests := []struct {
		name string
		f    *FieldInteger
		want *TypeProperty
	}{
		{
			name: "nil",
			f:    nil,
			want: &TypeProperty{},
		},
		{
			name: "success default nil",
			f:    &FieldInteger{},
			want: &TypeProperty{integer: &FieldInteger{
				defaultValue: nil,
				min:          nil,
				max:          nil,
			}},
		},
		{
			name: "success default nil",
			f:    &FieldInteger{defaultValue: nil},
			want: &TypeProperty{integer: &FieldInteger{defaultValue: nil}},
		},
		{
			name: "success default value",
			f: &FieldInteger{
				defaultValue: lo.ToPtr(123),
				min:          lo.ToPtr(100),
				max:          lo.ToPtr(200),
			},
			want: &TypeProperty{integer: &FieldInteger{
				defaultValue: lo.ToPtr(123),
				min:          lo.ToPtr(100),
				max:          lo.ToPtr(200),
			}},
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

func TestFieldInteger_DefaultValue(t *testing.T) {
	type fields struct {
		defaultValue *int
		min          *int
		max          *int
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
				min:          nil,
				max:          nil,
			},
			want: nil,
		},
		{
			name: "test nil",
			fields: fields{
				defaultValue: lo.ToPtr(123),
				min:          nil,
				max:          nil,
			},
			want: lo.ToPtr(123),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			f := &FieldInteger{
				defaultValue: tt.fields.defaultValue,
				min:          tt.fields.min,
				max:          tt.fields.max,
			}
			assert.Equalf(t, tt.want, f.DefaultValue(), "DefaultValue()")
		})
	}
}

func TestFieldInteger_Max(t *testing.T) {
	type fields struct {
		defaultValue *int
		min          *int
		max          *int
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
				min:          nil,
				max:          nil,
			},
			want: nil,
		},
		{
			name: "test nil",
			fields: fields{
				defaultValue: nil,
				min:          nil,
				max:          lo.ToPtr(123),
			},
			want: lo.ToPtr(123),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			f := &FieldInteger{
				defaultValue: tt.fields.defaultValue,
				min:          tt.fields.min,
				max:          tt.fields.max,
			}
			assert.Equalf(t, tt.want, f.Max(), "Max()")
		})
	}
}

func TestFieldInteger_Min(t *testing.T) {
	type fields struct {
		defaultValue *int
		min          *int
		max          *int
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
				min:          nil,
				max:          nil,
			},
			want: nil,
		},
		{
			name: "test nil",
			fields: fields{
				defaultValue: nil,
				min:          lo.ToPtr(123),
				max:          nil,
			},
			want: lo.ToPtr(123),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			f := &FieldInteger{
				defaultValue: tt.fields.defaultValue,
				min:          tt.fields.min,
				max:          tt.fields.max,
			}
			assert.Equalf(t, tt.want, f.Min(), "Min()")
		})
	}
}

package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNew(t *testing.T) {
	assert.Equal(t, &Value{
		t: TypeString,
		v: "a",
	}, New(TypeString, "a"))
}

func TestNewWithTypeRegistry(t *testing.T) {
	assert.Equal(t, &Value{
		t: TypeString,
		v: "a",
	}, NewWithTypeRegistry(TypeString, "a", nil))
}

func TestValue_IsEmpty(t *testing.T) {
	tests := []struct {
		name  string
		value *Value
		want  bool
	}{
		{
			name: "empty",
			want: true,
		},
		{
			name: "nil",
			want: true,
		},
		{
			name: "non-empty",
			value: &Value{
				t: Type("hoge"),
				v: "foo",
			},
			want: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.IsEmpty())
		})
	}
}

func TestValue_Clone(t *testing.T) {
	tp := &tpmock{}
	tpm := TypeRegistry{
		Type("hoge"): tp,
	}

	tests := []struct {
		name  string
		value *Value
		want  *Value
	}{
		{
			name: "ok",
			value: &Value{
				t: TypeString,
				v: "foo",
			},
			want: &Value{
				t: TypeString,
				v: "foo",
			},
		},
		{
			name: "custom type property",
			value: &Value{
				t: Type("hoge"),
				v: "foo",
				p: tpm,
			},
			want: &Value{
				t: Type("hoge"),
				v: "fooa",
				p: tpm,
			},
		},
		{
			name:  "nil",
			value: nil,
			want:  nil,
		},
		{
			name:  "empty",
			value: &Value{},
			want:  nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Clone())
		})
	}
}

func TestValue_Some(t *testing.T) {
	tp := &tpmock{}
	tpm := TypeRegistry{
		Type("hoge"): tp,
	}

	tests := []struct {
		name  string
		value *Value
		want  *Optional
	}{
		{
			name: "ok",
			value: &Value{
				t: TypeString,
				v: "foo",
			},
			want: &Optional{
				t: TypeString,
				v: &Value{
					t: TypeString,
					v: "foo",
				},
			},
		},
		{
			name: "custom type property",
			value: &Value{
				t: Type("hoge"),
				v: "fooa",
				p: tpm,
			},
			want: &Optional{
				t: Type("hoge"),
				v: &Value{
					t: Type("hoge"),
					v: "fooa",
					p: tpm,
				},
			},
		},
		{
			name:  "nil",
			value: nil,
			want:  nil,
		},
		{
			name:  "empty",
			value: &Value{},
			want:  nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Some())
		})
	}
}

func TestValue_Value(t *testing.T) {
	tests := []struct {
		name  string
		value *Value
		want  any
	}{
		{
			name:  "ok",
			value: &Value{t: TypeString, v: "a"},
			want:  "a",
		},
		{
			name:  "empty",
			value: &Value{},
		},
		{
			name: "nil",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if tt.want == nil {
				assert.Nil(t, tt.value.Value())
			} else {
				assert.Equal(t, tt.want, tt.value.Value())
			}
		})
	}
}

func TestValue_Type(t *testing.T) {
	tests := []struct {
		name  string
		value *Value
		want  Type
	}{
		{
			name:  "ok",
			value: &Value{t: TypeString, v: "a"},
			want:  TypeString,
		},
		{
			name:  "empty",
			value: &Value{},
			want:  TypeUnknown,
		},
		{
			name: "nil",
			want: TypeUnknown,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Type())
		})
	}
}

func TestValue_TypeProperty(t *testing.T) {
	tp := &tpmock{}
	tpm := TypeRegistry{
		Type("hoge"): tp,
	}

	tests := []struct {
		name  string
		value *Value
		want  TypeProperty
	}{
		{
			name: "default type",
			value: &Value{
				v: "string",
				t: TypeString,
			},
			want: defaultTypes.Get(TypeString),
		},
		{
			name: "custom type",
			value: &Value{
				v: "string",
				t: Type("hoge"),
				p: tpm,
			},
			want: tp,
		},
		{
			name:  "empty",
			value: &Value{},
			want:  nil,
		},
		{
			name: "nil",
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			res := tt.value.TypeProperty()
			if tt.want == nil {
				assert.Nil(t, res)
			} else {
				assert.Same(t, tt.want, res)
			}
		})
	}
}

func TestValue_Interface(t *testing.T) {
	tp := &tpmock{}
	tpm := TypeRegistry{
		"foo": tp,
	}

	tests := []struct {
		name  string
		value *Value
		want  any
	}{
		{
			name:  "string",
			value: &Value{t: TypeString, v: "hoge"},
			want:  "hoge",
		},
		{
			name: "custom",
			value: &Value{
				p: tpm,
				t: Type("foo"),
				v: "foo",
			},
			want: "foobar",
		},
		{
			name:  "empty",
			value: &Value{},
			want:  nil,
		},
		{
			name:  "nil",
			value: nil,
			want:  nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Interface())
		})
	}
}

func TestValue_Validate(t *testing.T) {
	tp := &tpmock{}
	tpm := TypeRegistry{
		"foo": tp,
	}

	tests := []struct {
		name  string
		value *Value
		want  bool
	}{
		{
			name:  "string",
			value: &Value{t: TypeString, v: "hoge"},
			want:  true,
		},
		{
			name: "custom",
			value: &Value{
				p: tpm,
				t: Type("foo"),
				v: "foo",
			},
			want: true,
		},
		{
			name:  "empty",
			value: &Value{},
			want:  false,
		},
		{
			name:  "nil",
			value: nil,
			want:  false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Validate())
		})
	}
}

func TestValue_Cast(t *testing.T) {
	type args struct {
		t Type
		p TypeRegistry
	}

	tests := []struct {
		name   string
		target *Value
		args   args
		want   *Value
	}{
		{
			name:   "diff type",
			target: &Value{t: TypeNumber, v: 1.1},
			args:   args{t: TypeString},
			want:   &Value{t: TypeString, v: "1.1"},
		},
		{
			name:   "same type",
			target: &Value{t: TypeNumber, v: 1.1},
			args:   args{t: TypeNumber},
			want:   &Value{t: TypeNumber, v: 1.1},
		},
		{
			name:   "failed to cast",
			target: &Value{t: TypeBool, v: true},
			args:   args{t: TypeDateTime},
			want:   nil,
		},
		{
			name:   "empty",
			target: &Value{},
			args:   args{t: TypeString},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{t: TypeString},
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Cast(tt.args.t, tt.args.p))
		})
	}
}

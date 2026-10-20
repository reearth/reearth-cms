package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNew(t *testing.T) {
	t.Parallel()

	assert.Equal(t, &Value{
		t: TypeText,
		v: "a",
	}, New(TypeText, "a"))
}

func TestValue_IsEmpty(t *testing.T) {
	t.Parallel()

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
			name:  "empty string",
			value: &Value{t: TypeText, v: ""},
			want:  true,
		},
		{
			name:  "non-empty",
			value: &Value{t: TypeText, v: "a"},
			want:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.IsEmpty())
		})
	}
}

func TestValue_Clone(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		value *Value
		want  *Value
	}{
		{
			name: "ok",
			value: &Value{
				t: TypeText,
				v: "foo",
			},
			want: &Value{
				t: TypeText,
				v: "foo",
			},
		},
		{
			name:  "url",
			value: TypeURL.Value("https://example.com/a"),
			want:  TypeURL.Value("https://example.com/a"),
		},
		{
			name:  "unknown type",
			value: &Value{t: Type("foo"), v: "foo"},
			want:  nil,
		},
		{
			name:  "nil value",
			value: &Value{t: TypeText},
			want:  nil,
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
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Clone())
			if tt.value != nil {
				assert.NotSame(t, tt.value, tt.value.Clone())
			}
		})
	}
}

func TestValue_Clone_URL(t *testing.T) {
	t.Parallel()

	v := TypeURL.Value("https://example.com/a")
	c := v.Clone()

	u, _ := c.ValueURL()
	u.Path = "/b"

	orig, _ := v.ValueURL()
	assert.Equal(t, "/a", orig.Path)
}

func TestValue_Some(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		value *Value
		want  *Optional
	}{
		{
			name: "ok",
			value: &Value{
				t: TypeText,
				v: "foo",
			},
			want: &Optional{
				t: TypeText,
				v: &Value{
					t: TypeText,
					v: "foo",
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
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Some())
		})
	}
}

func TestValue_AsMultiple(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		value *Value
		want  *Multiple
	}{
		{
			name: "ok",
			value: &Value{
				t: TypeText,
				v: "foo",
			},
			want: &Multiple{
				t: TypeText,
				v: []*Value{{
					t: TypeText,
					v: "foo",
				}},
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
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.AsMultiple())
		})
	}
}

func TestValue_Value(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		value *Value
		want  any
	}{
		{
			name:  "ok",
			value: &Value{t: TypeText, v: "a"},
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
	t.Parallel()

	tests := []struct {
		name  string
		value *Value
		want  Type
	}{
		{
			name:  "ok",
			value: &Value{t: TypeText, v: "a"},
			want:  TypeText,
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
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Type())
		})
	}
}

func TestValue_TypeProperty(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		value *Value
		want  TypeProperty
	}{
		{
			name: "default type",
			value: &Value{
				v: "string",
				t: TypeText,
			},
			want: defaultTypes.Get(TypeText),
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
	t.Parallel()

	tests := []struct {
		name  string
		value *Value
		want  any
	}{
		{
			name:  "string",
			value: &Value{t: TypeText, v: "hoge"},
			want:  "hoge",
		},
		{
			name: "Unknown",
			value: &Value{
				t: Type("bar"),
				v: "bar",
			},
			want: nil,
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
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Interface())
		})
	}
}

func TestValue_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		value *Value
		want  bool
	}{
		{
			name:  "string",
			value: &Value{t: TypeText, v: "hoge"},
			want:  true,
		},
		{
			name:  "unknown type",
			value: &Value{t: Type("foo"), v: "foo"},
			want:  false,
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
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.value.Validate())
		})
	}
}

func TestValue_Equal(t *testing.T) {
	t.Parallel()

	type args struct {
		v *Value
	}

	tests := []struct {
		name   string
		target *Value
		args   args
		want   bool
	}{
		{
			name:   "diff type",
			target: &Value{t: TypeNumber, v: 1.1},
			args:   args{v: TypeText.Value("1.1")},
			want:   false,
		},
		{
			name:   "same type",
			target: &Value{t: TypeNumber, v: 1.1},
			args:   args{v: TypeNumber.Value(1.1)},
			want:   true,
		},
		{
			name:   "empty",
			target: &Value{},
			args:   args{v: TypeText.Value("")},
			want:   false,
		},
		{
			name:   "both empty",
			target: &Value{},
			args:   args{v: &Value{}},
			want:   false,
		},
		{
			name:   "unknown type",
			target: &Value{t: Type("foo"), v: "foo"},
			args:   args{v: &Value{t: Type("foo"), v: "foo"}},
			want:   false,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{v: TypeText.Value("")},
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Equal(tt.args.v))
		})
	}
}

func TestValue_Cast(t *testing.T) {
	t.Parallel()

	type args struct {
		t Type
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
			args:   args{t: TypeText},
			want:   &Value{t: TypeText, v: "1.1"},
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
			args:   args{t: TypeText},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{t: TypeText},
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Cast(tt.args.t))
		})
	}
}

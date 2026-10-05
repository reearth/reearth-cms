package value

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewMultiple(t *testing.T) {
	m := NewMultiple(TypeUnknown, []any{})
	assert.Nil(t, m)

	m = NewMultiple(TypeBool, []any{true, "test"})
	assert.Equal(t, TypeBool, m.t)
	assert.Equal(t, []*Value{New(TypeBool, true)}, m.v)

	v := []*Value{New(TypeBool, true), New(TypeBool, false)}
	m = NewMultiple(TypeBool, []any{true, false})
	assert.NotNil(t, m)
	assert.Equal(t, TypeBool, m.t)
	assert.Equal(t, v, m.v)
	for i := range v {
		assert.Equal(t, v[i], m.v[i])
		assert.NotSame(t, v[i], m.v[i])
	}
}

func TestNewMultipleStrict(t *testing.T) {
	gid := id.NewItemGroupID()

	tests := []struct {
		name        string
		typ         Type
		input       []any
		want        *Multiple
		wantKept    []int
		wantInvalid []int
	}{
		{
			name:  "unknown type",
			typ:   TypeUnknown,
			input: []any{1},
		},
		{
			name:  "unknown type with nil input",
			typ:   TypeUnknown,
			input: nil,
		},
		{
			name:     "nil input",
			typ:      TypeBool,
			input:    nil,
			want:     &Multiple{t: TypeBool, v: []*Value{}},
			wantKept: []int{},
		},
		{
			name:     "empty input",
			typ:      TypeBool,
			input:    []any{},
			want:     &Multiple{t: TypeBool, v: []*Value{}},
			wantKept: []int{},
		},
		{
			name:     "all valid",
			typ:      TypeInteger,
			input:    []any{int64(1), int64(2)},
			want:     &Multiple{t: TypeInteger, v: []*Value{New(TypeInteger, int64(1)), New(TypeInteger, int64(2))}},
			wantKept: []int{0, 1},
		},
		{
			name:     "convertible values are kept",
			typ:      TypeInteger,
			input:    []any{"10", 2.0},
			want:     &Multiple{t: TypeInteger, v: []*Value{New(TypeInteger, int64(10)), New(TypeInteger, int64(2))}},
			wantKept: []int{0, 1},
		},
		{
			name:        "mixed valid, invalid and nil",
			typ:         TypeInteger,
			input:       []any{int64(1), "x", nil, int64(3), struct{}{}},
			want:        &Multiple{t: TypeInteger, v: []*Value{New(TypeInteger, int64(1)), New(TypeInteger, int64(3))}},
			wantKept:    []int{0, 3},
			wantInvalid: []int{1, 4},
		},
		{
			name:        "all invalid",
			typ:         TypeInteger,
			input:       []any{"x", struct{}{}},
			want:        &Multiple{t: TypeInteger, v: []*Value{}},
			wantKept:    []int{},
			wantInvalid: []int{0, 1},
		},
		{
			name:     "nil elements are skipped, not invalid",
			typ:      TypeInteger,
			input:    []any{nil, nil},
			want:     &Multiple{t: TypeInteger, v: []*Value{}},
			wantKept: []int{},
		},
		{
			// "" the type can't convert is no value, not an error
			name:     "unconvertible empty string is skipped, not invalid",
			typ:      TypeGroup,
			input:    []any{""},
			want:     &Multiple{t: TypeGroup, v: []*Value{}},
			wantKept: []int{},
		},
		{
			name:        "unconvertible empty string among valid and invalid values",
			typ:         TypeGroup,
			input:       []any{"", gid, "x"},
			want:        &Multiple{t: TypeGroup, v: []*Value{New(TypeGroup, gid)}},
			wantKept:    []int{1},
			wantInvalid: []int{2},
		},
		{
			// integer maps "" to an empty value rather than failing, so it is kept
			name:     "empty string mapped to empty value is kept",
			typ:      TypeInteger,
			input:    []any{"", int64(5)},
			want:     &Multiple{t: TypeInteger, v: []*Value{New(TypeInteger, ""), New(TypeInteger, int64(5))}},
			wantKept: []int{0, 1},
		},
		{
			name:     "convertible empty string is kept",
			typ:      TypeText,
			input:    []any{"", "a"},
			want:     &Multiple{t: TypeText, v: []*Value{New(TypeText, ""), New(TypeText, "a")}},
			wantKept: []int{0, 1},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			m, kept, invalid := NewMultipleStrict(tt.typ, tt.input)
			assert.Equal(t, tt.want, m)
			assert.Equal(t, tt.wantKept, kept)
			assert.Equal(t, tt.wantInvalid, invalid)
		})
	}
}

func TestMultipleFrom(t *testing.T) {
	m := MultipleFrom(TypeUnknown, []*Value{})
	assert.Nil(t, m)

	m = MultipleFrom(TypeBool, []*Value{New(TypeBool, true), New(TypeText, "test")})
	assert.Nil(t, m)

	v := []*Value{New(TypeBool, true), New(TypeBool, false)}
	m = MultipleFrom(TypeBool, v)
	assert.NotNil(t, m)
	assert.Equal(t, TypeBool, m.t)
	assert.Equal(t, v, m.v)
	for i := range v {
		assert.Equal(t, v[i], m.v[i])
		assert.NotSame(t, v[i], m.v[i])
	}
}

func TestMultiple_IsEmpty(t *testing.T) {
	var m *Multiple = nil
	assert.True(t, m.IsEmpty())

	m = &Multiple{}
	assert.True(t, m.IsEmpty())

	m.t = TypeBool
	assert.True(t, m.IsEmpty())

	m.v = nil
	assert.True(t, m.IsEmpty())

	m.v = []*Value{}
	assert.True(t, m.IsEmpty())

	m.v = []*Value{New(TypeBool, true)}
	assert.False(t, m.IsEmpty())
}

func TestMultiple_Len(t *testing.T) {
	var m *Multiple = nil
	assert.Equal(t, 0, m.Len())

	m = &Multiple{}
	assert.Equal(t, 0, m.Len())

	m.t = TypeBool
	assert.Equal(t, 0, m.Len())

	m.v = nil
	assert.Equal(t, 0, m.Len())

	m.v = []*Value{}
	assert.Equal(t, 0, m.Len())

	m.v = []*Value{New(TypeBool, true)}
	assert.Equal(t, 1, m.Len())

	m.v = []*Value{New(TypeBool, true), New(TypeBool, true)}
	assert.Equal(t, 2, m.Len())
}

func TestMultiple_First(t *testing.T) {
	var m *Multiple = nil
	assert.Nil(t, m.First())

	m = &Multiple{}
	assert.Nil(t, m.First())

	m.t = TypeBool
	assert.Nil(t, m.First())

	m.v = nil
	assert.Nil(t, m.First())

	m.v = []*Value{}
	assert.Nil(t, m.First())

	m.v = []*Value{New(TypeBool, true)}
	assert.Equal(t, New(TypeBool, true), m.First())
}

func TestMultiple_Clone(t *testing.T) {
	m := &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, true), New(TypeBool, false)},
	}

	c := m.Clone()
	assert.Equal(t, m, c)
	assert.NotSame(t, m, c)
	for i := 0; i < len(m.v); i++ {
		assert.Equal(t, m.v[i], c.v[i])
		assert.NotSame(t, m.v[i], c.v[i])
	}

	m = nil
	assert.Equal(t, m, m.Clone())
}

func TestMultiple_Values(t *testing.T) {
	v := []*Value{New(TypeBool, true), New(TypeBool, false)}
	m := &Multiple{
		t: TypeBool,
		v: v,
	}

	assert.Equal(t, v, m.Values())

	m = nil
	assert.Nil(t, m.Values())
}

func TestMultiple_Type(t *testing.T) {
	m := &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, true), New(TypeBool, false)},
	}

	assert.Equal(t, m.Type(), TypeBool)

	m = nil
	assert.Equal(t, m.Type(), TypeUnknown)
}

func TestMultiple_Interface(t *testing.T) {
	m := &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, true), New(TypeBool, false)},
	}
	assert.Equal(t, []any{true, false}, m.Interface())

	m = nil
	assert.Equal(t, []any{}, m.Interface())
}

func TestMultiple_Validate(t *testing.T) {
	m := &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, true), New(TypeBool, false)},
	}

	assert.Equal(t, m.Validate(), true)

	m = &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, true), New(TypeBool, "test")},
	}

	assert.Equal(t, m.Validate(), false)
}

func TestMultiple_Equal(t *testing.T) {
	var m, w *Multiple = nil, nil
	assert.Equal(t, m.Equal(w), true)

	m = &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, true), New(TypeBool, false)},
	}
	assert.Equal(t, m.Equal(w), false)

	w = &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, true)},
	}
	assert.Equal(t, m.Equal(w), false)

	w = &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, true), New(TypeBool, false), New(TypeBool, false)},
	}
	assert.Equal(t, m.Equal(w), false)

	w = &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, false), New(TypeBool, false)},
	}
	assert.Equal(t, m.Equal(w), false)

	w = &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, true), New(TypeBool, false)},
	}
	assert.Equal(t, m.Equal(w), true)

	w = &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, nil)},
	}
	m = &Multiple{
		t: TypeBool,
		v: []*Value{},
	}
	assert.Equal(t, m.Equal(w), true)
}

func TestMultiple_Cast(t *testing.T) {
	m := &Multiple{
		t: TypeBool,
		v: []*Value{New(TypeBool, true), New(TypeBool, false)},
	}
	w := &Multiple{
		t: TypeText,
		v: []*Value{New(TypeText, "true"), New(TypeText, "false")},
	}
	assert.Equal(t, w, m.Cast(TypeText))

	assert.Equal(t, m.Cast(TypeBool), m.Clone())
	assert.NotSame(t, m.Cast(TypeBool), m.Clone())

	m = nil
	assert.Nil(t, m.Cast(TypeText))
}

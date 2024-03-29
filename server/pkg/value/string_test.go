package value

import (
	"net/url"
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_propertyString_ToValue(t *testing.T) {
	u, _ := url.Parse("https://reearth.io")
	now := time.Now().Truncate(time.Second)

	tests := []struct {
		name  string
		args  []any
		want1 any
		want2 bool
	}{
		{
			name:  "string",
			args:  []any{"foobar", lo.ToPtr("foobar")},
			want1: "foobar",
			want2: true,
		},
		{
			name:  "number",
			args:  []any{1.12, lo.ToPtr(1.12)},
			want1: "1.12",
			want2: true,
		},
		{
			name:  "url",
			args:  []any{u},
			want1: "https://reearth.io",
			want2: true,
		},
		{
			name:  "time",
			args:  []any{now},
			want1: now.Format(time.RFC3339),
			want2: true,
		},
		{
			name:  "nil",
			args:  []any{(*string)(nil), nil},
			want1: nil,
			want2: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &propertyString{}
			for i, v := range tt.args {
				got1, got2 := p.ToValue(v)
				assert.Equal(t, tt.want1, got1, "test %d", i)
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
		})
	}
}

func Test_propertyString_ToInterface(t *testing.T) {
	v := "a"
	tt, ok := (&propertyString{}).ToInterface(v)
	assert.Equal(t, v, tt)
	assert.Equal(t, true, ok)
}

func Test_propertyString_IsEmpty(t *testing.T) {
	assert.True(t, (&propertyString{}).IsEmpty(""))
	assert.False(t, (&propertyString{}).IsEmpty("a"))
}

func Test_propertyString_Validate(t *testing.T) {
	assert.True(t, (&propertyString{}).Validate("a"))
	assert.False(t, (&propertyString{}).Validate(1))
}

func Test_propertyString_Equal(t *testing.T) {
	ps := &propertyString{}
	assert.True(t, ps.Equal("xxx", "xxx"))
}

func TestValue_ValueString(t *testing.T) {
	var v *Value
	got, ok := v.ValueString()
	assert.Equal(t, "", got)
	assert.Equal(t, false, ok)

	v = &Value{
		v: "xxx",
	}
	got, ok = v.ValueString()
	assert.Equal(t, "xxx", got)
	assert.Equal(t, true, ok)
	v = &Value{
		v: 0,
	}
	got, ok = v.ValueString()
	assert.Equal(t, "", got)
	assert.Equal(t, false, ok)
}

func TestMultiple_ValuesString(t *testing.T) {
	var m *Multiple
	got, ok := m.ValuesString()
	var expected []String
	assert.Equal(t, expected, got)
	assert.False(t, ok)
	m = NewMultiple(TypeText, []any{"a", "b", "c"})
	expected = []String{"a", "b", "c"}
	got, ok = m.ValuesString()
	assert.Equal(t, expected, got)
	assert.True(t, ok)
}

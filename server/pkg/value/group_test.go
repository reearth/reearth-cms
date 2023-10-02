package value

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
	"testing"
)

func Test_propertyGroup_ToValue(t *testing.T) {
	a := id.FieldIDList{id.NewFieldID()}

	tests := []struct {
		name  string
		args  []any
		want1 any
		want2 bool
	}{
		{
			name:  "string",
			args:  []any{[]string{a[0].String()}, []*string{a[0].StringRef()}},
			want1: a,
			want2: true,
		},
		{
			name:  "id",
			args:  []any{a},
			want1: a,
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
			p := &propertyGroup{}
			for i, v := range tt.args {
				got1, got2 := p.ToValue(v)
				assert.Equal(t, tt.want1, got1, "test %d", i)
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
		})
	}
}

func Test_propertyGroup_ToInterface(t *testing.T) {
	a := id.NewFieldID()
	tt, ok := (&propertyGroup{}).ToInterface(id.FieldIDList{a})
	assert.Equal(t, []string{a.String()}, tt)
	assert.Equal(t, true, ok)
}

func Test_propertyGroup_IsEmpty(t *testing.T) {
	assert.True(t, (&propertyGroup{}).IsEmpty(id.FieldIDList{}))
	assert.False(t, (&propertyGroup{}).IsEmpty(id.FieldIDList{id.NewFieldID()}))
}

func Test_propertyGroup_Validate(t *testing.T) {
	a := id.NewFieldID()
	assert.True(t, (&propertyGroup{}).Validate(id.FieldIDList{a}))
}

func Test_propertyGroup_Equal(t *testing.T) {
	pr := &propertyGroup{}
	iid1 := id.NewFieldID()
	iid2, _ := id.FieldIDFrom(iid1.String())
	assert.True(t, pr.Equal(id.FieldIDList{iid1}, id.FieldIDList{iid2}))
}

func TestValue_ValueGroup(t *testing.T) {
	var v *Value
	var iid id.FieldIDList
	got, ok := v.ValueGroup()
	assert.Equal(t, iid, got)
	assert.Equal(t, false, ok)

	iid = id.FieldIDList{id.NewFieldID()}
	v = &Value{
		v: iid,
	}
	got, ok = v.ValueGroup()
	assert.Equal(t, iid, got)
	assert.Equal(t, true, ok)
}

func TestMultiple_ValuesGroup(t *testing.T) {
	var m *Multiple
	got, ok := m.ValuesGroup()
	var expected []Group
	assert.Equal(t, expected, got)
	assert.Equal(t, false, ok)

	iid1 := id.NewFieldID()
	iid2 := id.NewFieldID()
	iid3 := id.NewFieldID()
	m = NewMultiple(TypeGroup, []any{id.FieldIDList{iid1, iid2, iid3}})
	expected = []Group{{iid1, iid2, iid3}}
	got, _ = m.ValuesGroup()
	assert.Equal(t, expected, got)
}

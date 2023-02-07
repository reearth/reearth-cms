package version

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewValue(t *testing.T) {
	vx, vy := New(), New()
	assert.Equal(t, &Value[string]{
		version: vx,
		parents: NewVersions(vy),
		refs:    NewRefs("a"),
		value:   "xxx",
	}, NewValue(vx, NewVersions(vy), NewRefs("a"), "xxx"))
	assert.Nil(t, NewValue(vx, NewVersions(vx), nil, ""))
	assert.Nil(t, NewValue(Version{}, nil, nil, ""))
}

func TestMustBeValue(t *testing.T) {
	vx, vy := New(), New()
	assert.Equal(t, &Value[string]{
		version: vx,
		parents: NewVersions(vy),
		refs:    NewRefs("a"),
		value:   "xxx",
	}, MustBeValue(vx, NewVersions(vy), NewRefs("a"), "xxx"))
	assert.Panics(t, func() { MustBeValue(vx, NewVersions(vx), nil, "") })
	assert.Panics(t, func() { MustBeValue(Version{}, nil, nil, "") })
}

func TestValue_Version(t *testing.T) {
	vx := New()
	assert.Equal(t, vx, Value[string]{
		version: vx,
	}.Version())
}

func TestValue_Parents(t *testing.T) {
	vx := New()
	v := &Value[string]{
		parents: NewVersions(vx),
	}
	assert.Equal(t, NewVersions(vx), v.Parents())
	assert.NotSame(t, v.parents, v.Parents())
	assert.NotSame(t, Versions{}, (&Value[string]{}).Parents())
}

func TestValue_Refs(t *testing.T) {
	v := &Value[string]{
		refs: NewRefs("a"),
	}
	assert.Equal(t, NewRefs("a"), v.Refs())
	assert.NotSame(t, v.refs, v.Refs())
	assert.NotSame(t, Refs{}, (&Value[string]{}).Refs())
}

func TestValue_Value(t *testing.T) {
	v := &Value[*string]{value: lo.ToPtr("x")}
	assert.Same(t, v.value, v.Value())
}

func TestValue_Ref(t *testing.T) {
	vx, vy := New(), New()
	r := Value[string]{
		version: vx,
		parents: NewVersions(vy),
		refs:    NewRefs("latest"),
		value:   "a",
	}
	assert.Equal(t, &r, r.Ref())
}

func TestValue_Clone(t *testing.T) {
	vx, vy := New(), New()
	assert.Nil(t, (*Value[any])(nil).Clone())
	v := &Value[string]{
		version: vx,
		parents: NewVersions(vy),
		refs:    NewRefs("latest"),
		value:   "a",
	}
	got := v.Clone()
	assert.Equal(t, v, got)
	assert.NotSame(t, v, got)
	assert.NotSame(t, v.parents, got.parents)
	assert.NotSame(t, v.refs, got.refs)

	v2 := &Value[string]{
		version: vx,
		value:   "a",
	}
	assert.Nil(t, v2.Clone().refs)
}

func TestValue_AddRefs(t *testing.T) {
	v := &Value[any]{}
	v.AddRefs("aaa", "bbb")
	assert.Equal(t, NewRefs("aaa", "bbb"), v.refs)
	v.AddRefs("ccc", "ddd")
	assert.Equal(t, NewRefs("aaa", "bbb", "ccc", "ddd"), v.refs)
}

func TestValue_DeleteRefs(t *testing.T) {
	v := &Value[any]{
		refs: NewRefs("aaa", "bbb", "ccc", "ddd"),
	}
	v.DeleteRefs("aaa", "bbb")
	assert.Equal(t, NewRefs("ccc", "ddd"), v.refs)
	v.DeleteRefs("ccc", "ddd")
	assert.Nil(t, v.refs)
}

func TestValueFrom(t *testing.T) {
	vx, vy := New(), New()
	v1 := &Value[string]{
		version: vx,
		parents: NewVersions(vy),
		refs:    NewRefs("a"),
		value:   "xxx",
	}
	v2 := &Value[string]{
		version: vx,
		parents: NewVersions(vy),
		refs:    NewRefs("a"),
		value:   "yyy",
	}
	assert.Equal(t, v2, ValueFrom(v1, "yyy"))
}

package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValue_Ref(t *testing.T) {
	vx, vy := New(), New()
	r := Value[string]{
		Version: vx,
		Parent:  NewVersions(vy),
		Refs:    NewRefs("latest"),
		Value:   "a",
	}
	assert.Equal(t, &r, r.Ref())
}

func TestValue_Clone(t *testing.T) {
	vx, vy := New(), New()
	assert.Nil(t, (*Value[any])(nil).Clone())
	v := &Value[string]{
		Version: vx,
		Parent:  NewVersions(vy),
		Refs:    NewRefs("latest"),
		Value:   "a",
	}
	got := v.Clone()
	assert.Equal(t, v, got)
	assert.NotSame(t, v, got)
	assert.NotSame(t, v.Parent, got.Parent)
	assert.NotSame(t, v.Refs, got.Refs)

	v2 := &Value[string]{
		Version: vx,
		Value:   "a",
	}
	assert.Nil(t, v2.Clone().Refs)
}

func TestValue_AddRefs(t *testing.T) {
	v := &Value[any]{}
	v.AddRefs("aaa", "bbb")
	assert.Equal(t, NewRefs("aaa", "bbb"), v.Refs)
	v.AddRefs("ccc", "ddd")
	assert.Equal(t, NewRefs("aaa", "bbb", "ccc", "ddd"), v.Refs)
}

func TestValue_DeleteRefs(t *testing.T) {
	v := &Value[any]{
		Refs: NewRefs("aaa", "bbb", "ccc", "ddd"),
	}
	v.DeleteRefs("aaa", "bbb")
	assert.Equal(t, NewRefs("ccc", "ddd"), v.Refs)
	v.DeleteRefs("ccc", "ddd")
	assert.Nil(t, v.Refs)
}

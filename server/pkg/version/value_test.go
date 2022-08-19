package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValue_Ref(t *testing.T) {
	vx, vy := New(), New()
	r := Value[string]{
		Version: vx,
		Prev:    vy.Ref(),
		Refs:    RefsFrom("latest"),
		Value:   "a",
	}
	assert.Equal(t, &r, r.Ref())
}

func TestValue_Clone(t *testing.T) {
	vx, vy := New(), New()
	assert.Nil(t, (*Value[any])(nil).Clone())
	v := &Value[string]{
		Version: vx,
		Prev:    vy.Ref(),
		Refs:    RefsFrom("latest"),
		Value:   "a",
	}
	got := v.Clone()
	assert.Equal(t, v, got)
	assert.NotSame(t, v, got)
	assert.NotSame(t, v.Prev, got.Prev)
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
	assert.Equal(t, RefsFrom("aaa", "bbb"), v.Refs)
	v.AddRefs("ccc", "ddd")
	assert.Equal(t, RefsFrom("aaa", "bbb", "ccc", "ddd"), v.Refs)
}

func TestValue_DeleteRefs(t *testing.T) {
	v := &Value[any]{
		Refs: RefsFrom("aaa", "bbb", "ccc", "ddd"),
	}
	v.DeleteRefs("aaa", "bbb")
	assert.Equal(t, RefsFrom("ccc", "ddd"), v.Refs)
	v.DeleteRefs("ccc", "ddd")
	assert.Nil(t, v.Refs)
}

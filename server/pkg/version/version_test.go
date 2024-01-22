package version

import (
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewValue(t *testing.T) {
	vx, vy := NewID(), NewID()
	assert.Equal(t, &Version[string, int]{
		value: Value[string]{
			version: vx,
			parents: NewIDs(vy),
			refs:    NewRefs("a"),
			time:    time.Time{},
			value:   lo.ToPtr("xxx"),
		},
		meta: lo.ToPtr(123),
	}, New(vx, NewIDs(vy), NewRefs("a"), time.Time{}, lo.ToPtr("xxx"), lo.ToPtr(123)))
	assert.Nil(t, New[string, int](vx, NewIDs(vx), nil, time.Time{}, nil, nil))
	assert.Nil(t, New[string, int](ID{}, nil, nil, time.Time{}, nil, nil))
}

func TestMustBeValue(t *testing.T) {
	vx, vy := NewID(), NewID()
	assert.Equal(t, &Version[string, int]{
		value: Value[string]{
			version: vx,
			parents: NewIDs(vy),
			refs:    NewRefs("a"),
			time:    time.Time{},
			value:   lo.ToPtr("xxx"),
		},
		meta: lo.ToPtr(123),
	}, Must(vx, NewIDs(vy), NewRefs("a"), time.Time{}, lo.ToPtr("xxx"), lo.ToPtr(123)))
	assert.Panics(t, func() { Must(vx, NewIDs(vx), nil, time.Time{}, lo.ToPtr(""), lo.ToPtr(0)) })
	assert.Panics(t, func() { Must(ID{}, nil, nil, time.Time{}, lo.ToPtr(""), lo.ToPtr(0)) })
}

func TestValue_Version(t *testing.T) {
	vx := NewID()
	assert.Equal(t, vx, (&Version[string, int]{
		value: Value[string]{
			version: vx,
		},
	}).Version())
}

func TestValue_Parents(t *testing.T) {
	vx := NewID()
	v := &Version[string, int]{
		value: Value[string]{
			parents: NewIDs(vx),
		},
	}
	assert.Equal(t, NewIDs(vx), v.Parents())
	assert.NotSame(t, v.value.parents, v.Parents())
	assert.NotSame(t, IDs{}, (&Version[string, int]{}).Parents())
}

func TestValue_Refs(t *testing.T) {
	v := &Version[string, int]{
		value: Value[string]{
			refs: NewRefs("a"),
		},
	}
	assert.Equal(t, NewRefs("a"), v.Refs())
	assert.NotSame(t, v.value.refs, v.Refs())
	assert.NotSame(t, Refs{}, (&Version[string, int]{}).Refs())
}

func TestValue_Value(t *testing.T) {
	v := &Version[string, int]{value: Value[string]{value: lo.ToPtr("x")}}
	assert.Same(t, v.value.value, v.Value())
}

func TestValue_Ref(t *testing.T) {
	vx, vy := NewID(), NewID()
	r := Version[string, int]{
		value: Value[string]{
			version: vx,
			parents: NewIDs(vy),
			refs:    NewRefs("latest"),
			value:   lo.ToPtr("a"),
		},
	}
	assert.Equal(t, &r, r.Ref())
}

func TestValue_Clone(t *testing.T) {
	vx, vy := NewID(), NewID()
	assert.Nil(t, (*Version[any, any])(nil).Clone())
	v := &Version[string, int]{
		value: Value[string]{
			version: vx,
			parents: NewIDs(vy),
			refs:    NewRefs("latest"),
			value:   lo.ToPtr("a"),
		},
		meta: lo.ToPtr(123),
	}
	got := v.Clone()
	assert.Equal(t, v, got)
	assert.NotSame(t, v, got)
	assert.NotSame(t, v.value.parents, got.value.parents)
	assert.NotSame(t, v.value.refs, got.value.refs)

	v2 := &Version[string, int]{
		value: Value[string]{
			version: vx,
			value:   lo.ToPtr("a"),
		},
	}
	assert.Nil(t, v2.Clone().value.refs)
}

func TestValue_AddRefs(t *testing.T) {
	v := &Version[any, any]{
		value: Value[any]{},
	}
	v.AddRefs("aaa", "bbb")
	assert.Equal(t, NewRefs("aaa", "bbb"), v.value.refs)
	v.AddRefs("ccc", "ddd")
	assert.Equal(t, NewRefs("aaa", "bbb", "ccc", "ddd"), v.value.refs)
}

func TestValue_DeleteRefs(t *testing.T) {
	v := &Version[any, any]{
		value: Value[any]{
			refs: NewRefs("aaa", "bbb", "ccc", "ddd"),
		},
	}
	v.DeleteRefs("aaa", "bbb")
	assert.Equal(t, NewRefs("ccc", "ddd"), v.value.refs)
	v.DeleteRefs("ccc", "ddd")
	assert.Nil(t, v.value.refs)
}

func TestValueFrom(t *testing.T) {
	vx, vy := NewID(), NewID()
	v1 := &Version[string, int]{
		value: Value[string]{
			version: vx,
			parents: NewIDs(vy),
			refs:    NewRefs("a"),
			value:   lo.ToPtr("xxx"),
		},
		meta: lo.ToPtr(123),
	}
	v2 := &Version[string, int]{
		value: Value[string]{
			version: vx,
			parents: NewIDs(vy),
			refs:    NewRefs("a"),
			value:   lo.ToPtr("yyy"),
		},
		meta: lo.ToPtr(123),
	}
	assert.Equal(t, v2, From(v1, lo.ToPtr("yyy"), lo.ToPtr(123)))
}

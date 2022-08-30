package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewValues(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	v := NewValue(vx, nil, nil, 0)
	v2 := NewValue(vx, nil, NewRefs("y"), 1)
	v3 := NewValue(vy, nil, NewRefs("y"), 1)
	v4 := NewValue(vy, NewVersions(vz), nil, 0)
	assert.Equal(t, &Values[int]{
		inner: []*Value[int]{v},
	}, NewValues(v))
	assert.Nil(t, NewValues(v, v2))
	assert.Nil(t, NewValues(v2, v3))
	assert.Nil(t, NewValues(v4))
}

func TestValues_MustBeValues(t *testing.T) {
	vx := New()
	v := NewValue(vx, nil, nil, 0)
	v2 := NewValue(vx, nil, nil, 0)

	assert.Equal(t, &Values[int]{
		inner: []*Value[int]{v},
	}, MustBeValues(v))
	assert.Panics(t, func() { MustBeValues(v, v2) })
}

func TestValues_IsArchived(t *testing.T) {
	v := &Values[int]{}
	assert.False(t, v.IsArchived())
	assert.Same(t, v, v.SetArchived(true))
	assert.True(t, v.IsArchived())
	assert.Same(t, v, v.SetArchived(false))
	assert.False(t, v.IsArchived())
}

func TestValues_Get(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	v := &Values[string]{
		inner: []*Value[string]{
			NewValue(vx, nil, nil, "foo1"),
			NewValue(vy, nil, nil, "foo2"),
			NewValue(vz, nil, NewRefs(Latest), "foo3"),
		},
	}

	got := v.Get(vz.OrRef())
	assert.Equal(t, NewValue(vz, nil, NewRefs(Latest), "foo3"), got)

	// cannot modify
	got.value = "d"
	assert.Equal(t, "foo3", v.Get(vz.OrRef()).Value())

	got = v.Get(Ref(Latest).OrVersion())
	assert.Equal(t, NewValue(vz, nil, NewRefs(Latest), "foo3"), got)

	// cannot modify
	got.value = "d"
	assert.Equal(t, "foo3", v.Get(Ref(Latest).OrVersion()).Value())

	assert.Nil(t, v.Get(New().OrRef()))
	assert.Nil(t, v.Get(Ref("main2").OrVersion()))
}

func TestValues_Latest(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	assert.Equal(
		t,
		NewValue(vx, nil, NewRefs("latest"), ""),
		(&Values[string]{
			inner: []*Value[string]{
				NewValue(vx, nil, NewRefs("latest"), ""),
				NewValue(vy, nil, nil, ""),
				NewValue(vz, nil, nil, ""),
			},
		}).Latest(),
	)
	assert.Nil(t, (&Values[string]{
		inner: []*Value[string]{
			NewValue(vx, nil, NewRefs("a"), ""),
			NewValue(vy, nil, nil, ""),
			NewValue(vz, nil, nil, ""),
		},
	}).Latest())
	assert.Nil(t, (*Values[string])(nil).Latest())
}

func TestValues_LatestVersion(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	assert.Equal(t, vx.Ref(), (&Values[string]{
		inner: []*Value[string]{
			NewValue(vx, nil, NewRefs("latest"), ""),
			NewValue(vy, nil, nil, ""),
			NewValue(vz, nil, nil, ""),
		},
	}).LatestVersion())
	assert.Nil(t, (&Values[string]{
		inner: []*Value[string]{
			NewValue(vx, nil, NewRefs("a"), ""),
			NewValue(vy, nil, nil, ""),
			NewValue(vz, nil, nil, ""),
		},
	}).LatestVersion())
	assert.Nil(t, (*Values[string])(nil).LatestVersion())
}

func TestValues_All(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	v := &Values[string]{
		inner: []*Value[string]{
			NewValue(vx, nil, NewRefs("latest"), "a"),
			NewValue(vy, nil, nil, "b"),
			NewValue(vz, nil, nil, "c"),
		},
	}
	got := v.All()
	assert.Equal(t, v.inner, got)
	assert.NotSame(t, v.inner, got)
	assert.Nil(t, (*Values[string])(nil).All())
}

func TestValues_Clone(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	v := &Values[string]{
		inner: []*Value[string]{
			NewValue(vx, nil, NewRefs("latest"), "a"),
			NewValue(vy, nil, nil, "b"),
			NewValue(vz, nil, nil, "c"),
		},
		archived: true,
	}
	got := v.Clone()
	assert.Equal(t, v, got)
	assert.NotSame(t, v, got)
	assert.NotSame(t, v.inner, got.inner)
	assert.Nil(t, (*Values[string])(nil).Clone())
}

func TestValues_Add(t *testing.T) {
	vx, vy := New(), New()
	v := &Values[string]{
		inner: []*Value[string]{
			NewValue(vx, NewVersions(vy), NewRefs(Latest), "1"),
			NewValue(vy, nil, NewRefs("a"), "2"),
		},
	}

	v.Add("3", Ref("a").OrVersion().Ref())
	vv := v.Get(Ref("a").OrVersion())
	assert.Equal(t, NewValue(vv.Version(), NewVersions(vy), NewRefs("a"), "3"), vv)
	assert.Equal(t, NewValue(vy, nil, nil, "2"), v.Get(vy.OrRef()))
	assert.True(t, v.validate())

	v.Add("3", Ref("").OrVersion().Ref())
	assert.Nil(t, v.Get(Ref("").OrVersion()))

	v.archived = true
	v.Add("3", Ref("xxx").OrVersion().Ref())
	assert.Nil(t, v.Get(Ref("xxx").OrVersion()))
}

func TestValues_UpdateRef(t *testing.T) {
	vx, vy := New(), New()

	type args struct {
		ref Ref
		vr  *VersionOrRef
	}

	tests := []struct {
		name   string
		target *Values[string]
		args   args
		want   *Values[string]
	}{
		{
			name: "ref is not found",
			target: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, nil, "a"),
					NewValue(vy, nil, NewRefs("B"), "b"),
				}},
			args: args{
				ref: "A",
				vr:  nil,
			},
			want: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, nil, "a"),
					NewValue(vy, nil, NewRefs("B"), "b"),
				},
			},
		},
		{
			name: "ref should be deleted",
			target: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, nil, "a"),
					NewValue(vy, nil, NewRefs("B"), "b"),
				},
			},
			args: args{
				ref: "B",
				vr:  nil,
			},
			want: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, nil, "a"),
					NewValue(vy, nil, nil, "b"),
				},
			},
		},
		{
			name: "new ref should be set",
			target: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, nil, "a"),
					NewValue(vy, nil, NewRefs("B"), "b"),
				},
			},
			args: args{
				ref: "A",
				vr:  vx.OrRef().Ref(),
			},
			want: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, NewRefs("A"), "a"),
					NewValue(vy, nil, NewRefs("B"), "b"),
				},
			},
		},
		{
			name: "ref should be moved",
			target: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, NewRefs("A"), "a"),
					NewValue(vy, nil, NewRefs("B"), "b"),
				},
			},
			args: args{
				ref: "B",
				vr:  Ref("A").OrVersion().Ref(),
			},
			want: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, NewRefs("A", "B"), "a"),
					NewValue(vy, nil, nil, "b"),
				},
			},
		},
		{
			name: "latest should not be updated",
			target: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, nil, "a"),
					NewValue(vy, NewVersions(vx), NewRefs(Latest), "b"),
				},
			},
			args: args{
				ref: Latest,
				vr:  vx.OrRef().Ref(),
			},
			want: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, nil, "a"),
					NewValue(vy, NewVersions(vx), NewRefs(Latest), "b"),
				},
			},
		},
		{
			name: "archived should not be updated",
			target: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, nil, "a"),
				},
				archived: true,
			},
			args: args{
				ref: "x",
				vr:  vx.OrRef().Ref(),
			},
			want: &Values[string]{
				inner: []*Value[string]{
					NewValue(vx, nil, nil, "a"),
				},
				archived: true,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			target := tt.target
			target.UpdateRef(tt.args.ref, tt.args.vr)
			assert.Equal(t, tt.want, target)
			assert.True(t, target.validate())
		})
	}
}

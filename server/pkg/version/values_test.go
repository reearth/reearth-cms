package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewValues(t *testing.T) {
	v := &Value[int]{
		Version: "x",
		Value:   0,
	}
	v2 := &Value[int]{
		Version: "x",
		Value:   1,
		Refs:    RefsFrom("y"),
	}
	v3 := &Value[int]{
		Version: "y",
		Value:   1,
		Refs:    RefsFrom("y"),
	}
	v4 := &Value[int]{
		Version: "y",
		Prev:    Version("aaa").Ref(),
	}
	assert.Equal(t, &Values[int]{
		inner: []*Value[int]{v},
	}, NewValues(v))
	assert.Nil(t, NewValues(v, v2))
	assert.Nil(t, NewValues(v2, v3))
	assert.Nil(t, NewValues(v4))
}

func TestValues_MustBeValues(t *testing.T) {
	v := &Value[int]{
		Version: "x",
	}
	v2 := &Value[int]{
		Version: "x",
	}

	assert.Equal(t, &Values[int]{
		inner: []*Value[int]{v},
	}, MustBeValues(v))
	assert.Panics(t, func() { MustBeValues(v, v2) })
}

func TestValues_Get(t *testing.T) {
	v := &Values[string]{
		inner: []*Value[string]{
			{
				Value:   "foo1",
				Version: "a",
			},
			{
				Value:   "foo2",
				Version: "b",
			},
			{
				Value:   "foo3",
				Version: "c",
				Refs:    RefsFrom(Latest),
			},
		},
	}

	got := v.Get(Version("c").OrRef())
	assert.Equal(t, &Value[string]{
		Value:   "foo3",
		Version: "c",
		Refs:    RefsFrom(Latest),
	}, got)

	// cannot modify
	got.Value = "d"
	assert.Equal(t, "foo3", v.Get(Version("c").OrRef()).Value)

	got = v.Get(Ref(Latest).OrVersion())
	assert.Equal(t, &Value[string]{
		Value:   "foo3",
		Version: "c",
		Refs:    RefsFrom(Latest),
	}, got)

	// cannot modify
	got.Value = "d"
	assert.Equal(t, "foo3", v.Get(Ref(Latest).OrVersion()).Value)

	assert.Nil(t, v.Get(Version("d").OrRef()))
	assert.Nil(t, v.Get(Ref("main2").OrVersion()))
}

func TestValues_Latest(t *testing.T) {
	assert.Equal(
		t,
		&Value[string]{Version: "x", Refs: RefsFrom("latest")},
		(&Values[string]{
			inner: []*Value[string]{
				{Version: "x", Refs: RefsFrom("latest")},
				{Version: "y"},
				{Version: "z"},
			},
		}).Latest(),
	)
	assert.Nil(t, (&Values[string]{
		inner: []*Value[string]{
			{Version: "x", Refs: RefsFrom("a")},
			{Version: "y"},
			{Version: "z"},
		},
	}).Latest())
	assert.Nil(t, (*Values[string])(nil).Latest())
}

func TestValues_LatestVersion(t *testing.T) {
	assert.Equal(t, Version("x").Ref(), (&Values[string]{
		inner: []*Value[string]{
			{Version: "x", Refs: RefsFrom("latest")},
			{Version: "y"},
			{Version: "z"},
		},
	}).LatestVersion())
	assert.Nil(t, (&Values[string]{
		inner: []*Value[string]{
			{Version: "x", Refs: RefsFrom("a")},
			{Version: "y"},
			{Version: "z"},
		},
	}).LatestVersion())
	assert.Nil(t, (*Values[string])(nil).LatestVersion())
}

func TestValues_All(t *testing.T) {
	v := &Values[string]{
		inner: []*Value[string]{
			{Version: "x", Refs: RefsFrom("latest")},
			{Version: "y"},
			{Version: "z"},
		},
	}
	got := v.All()
	assert.Equal(t, v.inner, got)
	assert.NotSame(t, v.inner, got)
	assert.Nil(t, (*Values[string])(nil).All())
}

func TestValues_Clone(t *testing.T) {
	v := &Values[string]{
		inner: []*Value[string]{
			{Version: "x", Refs: RefsFrom("latest")},
			{Version: "y"},
			{Version: "z"},
		},
	}
	got := v.Clone()
	assert.Equal(t, v, got)
	assert.NotSame(t, v, got)
	assert.NotSame(t, v.inner, got.inner)
	assert.Nil(t, (*Values[string])(nil).Clone())
}

func TestValues_Add(t *testing.T) {
	v := &Values[string]{
		inner: []*Value[string]{
			{Version: "x", Prev: Version("y").Ref(), Refs: RefsFrom(Latest), Value: "1"},
			{Version: "y", Refs: RefsFrom("a"), Value: "2"},
		},
	}

	v.Add("3", Ref("a").Ref())
	vv := v.Get(Ref("a").OrVersion())
	assert.Equal(t, &Value[string]{
		Version: vv.Version,
		Prev:    Version("y").Ref(),
		Refs:    RefsFrom("a"),
		Value:   "3",
	}, vv)
	assert.Equal(t, &Value[string]{
		Version: "y",
		Value:   "2",
	}, v.Get(Version("y").OrRef()))
	assert.True(t, v.validate())
}

func TestValues_UpdateRef(t *testing.T) {
	type args struct {
		ref     Ref
		version *Version
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
					{Value: "a", Version: "a", Refs: nil},
					{Value: "b", Version: "b", Refs: RefsFrom("B")},
				}},
			args: args{
				ref:     "A",
				version: nil,
			},
			want: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: "a", Refs: nil},
					{Value: "b", Version: "b", Refs: RefsFrom("B")},
				},
			},
		},
		{
			name: "ref should be deleted",
			target: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: "a", Refs: nil},
					{Value: "b", Version: "b", Refs: RefsFrom("B")},
				},
			},
			args: args{
				ref:     "B",
				version: nil,
			},
			want: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: "a", Refs: nil},
					{Value: "b", Version: "b", Refs: nil},
				},
			},
		},
		{
			name: "new ref should be set",
			target: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: "a", Refs: nil},
					{Value: "b", Version: "b", Refs: RefsFrom("B")},
				},
			},
			args: args{
				ref:     "A",
				version: Version("a").Ref(),
			},
			want: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: Version("a"), Refs: RefsFrom("A")},
					{Value: "b", Version: Version("b"), Refs: RefsFrom("B")},
				},
			},
		},
		{
			name: "ref should be moved",
			target: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: Version("a"), Refs: nil},
					{Value: "b", Version: Version("b"), Refs: RefsFrom("B")},
				},
			},
			args: args{
				ref:     "B",
				version: Version("a").Ref(),
			},
			want: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: Version("a"), Refs: RefsFrom("B")},
					{Value: "b", Version: Version("b"), Refs: nil},
				},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			target := tt.target
			target.UpdateRef(tt.args.ref, tt.args.version)
			assert.Equal(t, tt.want, target)
			assert.True(t, target.validate())
		})
	}
}

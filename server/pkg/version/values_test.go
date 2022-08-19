package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewValues(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	v := &Value[int]{
		Version: vx,
		Value:   0,
	}
	v2 := &Value[int]{
		Version: vx,
		Value:   1,
		Refs:    RefsFrom("y"),
	}
	v3 := &Value[int]{
		Version: vy,
		Value:   1,
		Refs:    RefsFrom("y"),
	}
	v4 := &Value[int]{
		Version: vy,
		Prev:    Version(vz).Ref(),
	}
	assert.Equal(t, &Values[int]{
		inner: []*Value[int]{v},
	}, NewValues(v))
	assert.Nil(t, NewValues(v, v2))
	assert.Nil(t, NewValues(v2, v3))
	assert.Nil(t, NewValues(v4))
}

func TestValues_MustBeValues(t *testing.T) {
	vx := New()
	v := &Value[int]{
		Version: vx,
	}
	v2 := &Value[int]{
		Version: vx,
	}

	assert.Equal(t, &Values[int]{
		inner: []*Value[int]{v},
	}, MustBeValues(v))
	assert.Panics(t, func() { MustBeValues(v, v2) })
}

func TestValues_Get(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	v := &Values[string]{
		inner: []*Value[string]{
			{
				Value:   "foo1",
				Version: vx,
			},
			{
				Value:   "foo2",
				Version: vy,
			},
			{
				Value:   "foo3",
				Version: vz,
				Refs:    RefsFrom(Latest),
			},
		},
	}

	got := v.Get(vz.OrRef())
	assert.Equal(t, &Value[string]{
		Value:   "foo3",
		Version: vz,
		Refs:    RefsFrom(Latest),
	}, got)

	// cannot modify
	got.Value = "d"
	assert.Equal(t, "foo3", v.Get(vz.OrRef()).Value)

	got = v.Get(Ref(Latest).OrVersion())
	assert.Equal(t, &Value[string]{
		Value:   "foo3",
		Version: vz,
		Refs:    RefsFrom(Latest),
	}, got)

	// cannot modify
	got.Value = "d"
	assert.Equal(t, "foo3", v.Get(Ref(Latest).OrVersion()).Value)

	assert.Nil(t, v.Get(New().OrRef()))
	assert.Nil(t, v.Get(Ref("main2").OrVersion()))
}

func TestValues_Latest(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	assert.Equal(
		t,
		&Value[string]{Version: vx, Refs: RefsFrom("latest")},
		(&Values[string]{
			inner: []*Value[string]{
				{Version: vx, Refs: RefsFrom("latest")},
				{Version: vy},
				{Version: vz},
			},
		}).Latest(),
	)
	assert.Nil(t, (&Values[string]{
		inner: []*Value[string]{
			{Version: vx, Refs: RefsFrom("a")},
			{Version: vy},
			{Version: vz},
		},
	}).Latest())
	assert.Nil(t, (*Values[string])(nil).Latest())
}

func TestValues_LatestVersion(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	assert.Equal(t, vx.Ref(), (&Values[string]{
		inner: []*Value[string]{
			{Version: vx, Refs: RefsFrom("latest")},
			{Version: vy},
			{Version: vz},
		},
	}).LatestVersion())
	assert.Nil(t, (&Values[string]{
		inner: []*Value[string]{
			{Version: vx, Refs: RefsFrom("a")},
			{Version: vy},
			{Version: vz},
		},
	}).LatestVersion())
	assert.Nil(t, (*Values[string])(nil).LatestVersion())
}

func TestValues_All(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	v := &Values[string]{
		inner: []*Value[string]{
			{Version: vx, Refs: RefsFrom("latest")},
			{Version: vy},
			{Version: vz},
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
			{Version: vx, Refs: RefsFrom("latest")},
			{Version: vy},
			{Version: vz},
		},
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
			{Version: vx, Prev: vy.Ref(), Refs: RefsFrom(Latest), Value: "1"},
			{Version: vy, Refs: RefsFrom("a"), Value: "2"},
		},
	}

	v.Add("3", Ref("a").Ref())
	vv := v.Get(Ref("a").OrVersion())
	assert.Equal(t, &Value[string]{
		Version: vv.Version,
		Prev:    vy.Ref(),
		Refs:    RefsFrom("a"),
		Value:   "3",
	}, vv)
	assert.Equal(t, &Value[string]{
		Version: vy,
		Value:   "2",
	}, v.Get(vy.OrRef()))
	assert.True(t, v.validate())
}

func TestValues_UpdateRef(t *testing.T) {
	vx, vy := New(), New()

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
					{Value: "a", Version: vx, Refs: nil},
					{Value: "b", Version: vy, Refs: RefsFrom("B")},
				}},
			args: args{
				ref:     "A",
				version: nil,
			},
			want: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: vx, Refs: nil},
					{Value: "b", Version: vy, Refs: RefsFrom("B")},
				},
			},
		},
		{
			name: "ref should be deleted",
			target: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: vx, Refs: nil},
					{Value: "b", Version: vy, Refs: RefsFrom("B")},
				},
			},
			args: args{
				ref:     "B",
				version: nil,
			},
			want: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: vx, Refs: nil},
					{Value: "b", Version: vy, Refs: nil},
				},
			},
		},
		{
			name: "new ref should be set",
			target: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: vx, Refs: nil},
					{Value: "b", Version: vy, Refs: RefsFrom("B")},
				},
			},
			args: args{
				ref:     "A",
				version: vx.Ref(),
			},
			want: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: vx, Refs: RefsFrom("A")},
					{Value: "b", Version: vy, Refs: RefsFrom("B")},
				},
			},
		},
		{
			name: "ref should be moved",
			target: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: vx, Refs: nil},
					{Value: "b", Version: vy, Refs: RefsFrom("B")},
				},
			},
			args: args{
				ref:     "B",
				version: vx.Ref(),
			},
			want: &Values[string]{
				inner: []*Value[string]{
					{Value: "a", Version: vx, Refs: RefsFrom("B")},
					{Value: "b", Version: vy, Refs: nil},
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

package mongogit

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestVersion_OrRef(t *testing.T) {
	assert.Equal(t, VersionOrRef{version: Version("x")}, Version("x").OrRef())
	assert.Equal(t, VersionOrRef{}, VersionZero.OrRef())
}

func TestRef_OrVersion(t *testing.T) {
	assert.Equal(t, VersionOrRef{ref: Ref("x")}, Ref("x").OrVersion())
	assert.Equal(t, VersionOrRef{}, Ref("").OrVersion())
}

func TestRefs_Get(t *testing.T) {
	assert.Equal(t, Version("x"), Refs{"a": "x"}.Get("a"))
	assert.Equal(t, VersionZero, Refs{}.Get("x"))
	assert.Equal(t, VersionZero, Refs(nil).Get("x"))
}

func TestVersionOrRef_IsZero(t *testing.T) {
	assert.False(t, Version("x").OrRef().IsZero())
	assert.False(t, Ref("x").OrVersion().IsZero())
	assert.True(t, Version("").OrRef().IsZero())
	assert.True(t, Ref("").OrVersion().IsZero())
	assert.True(t, VersionOrRef{}.IsZero())
}

func TestVersionOrRef_Match(t *testing.T) {
	called := 0
	Version("x").OrRef().Match(func(v Version) {
		assert.Equal(t, Version("x"), v)
		called++
	}, func(_ Ref) {
		panic("this function should not be called!")
	})
	assert.Equal(t, 1, called)
	Version("x").OrRef().Match(nil, nil)

	Ref("y").OrVersion().Match(func(_ Version) {
		panic("this function should not be called!")
	}, func(r Ref) {
		assert.Equal(t, Ref("y"), r)
		called++
	})
	assert.Equal(t, 2, called)
	Version("y").OrRef().Match(nil, nil)

	Version("").OrRef().Match(func(_ Version) {
		panic("this function should not be called!")
	}, func(r Ref) {
		panic("this function should not be called!")
	})

	Ref("").OrVersion().Match(func(_ Version) {
		panic("this function should not be called!")
	}, func(r Ref) {
		panic("this function should not be called!")
	})

	VersionOrRef{}.Match(func(_ Version) {
		panic("this function should not be called!")
	}, func(_ Ref) {
		panic("this function should not be called!")
	})
}

func TestMatchVersionOrRef(t *testing.T) {
	assert.Equal(t, 1, MatchVersionOrRef(Version("x").OrRef(), func(v Version) int {
		assert.Equal(t, Version("x"), v)
		return 1
	}, func(_ Ref) int { panic("this function should not be called!") }))
	Version("x").OrRef().Match(nil, nil)

	assert.Equal(t, 1, MatchVersionOrRef(Ref("y").OrVersion(), func(_ Version) int {
		panic("this function should not be called!")
	}, func(r Ref) int {
		assert.Equal(t, Ref("y"), r)
		return 1
	}))
	Version("y").OrRef().Match(nil, nil)

	assert.Equal(t, 0, MatchVersionOrRef(Version("").OrRef(), func(_ Version) int {
		panic("this function should not be called!")
	}, func(r Ref) int {
		panic("this function should not be called!")
	}))

	assert.Equal(t, 0, MatchVersionOrRef(Ref("").OrVersion(), func(_ Version) int {
		panic("this function should not be called!")
	}, func(r Ref) int {
		panic("this function should not be called!")
	}))

	assert.Equal(t, 0, MatchVersionOrRef(VersionOrRef{}, func(_ Version) int {
		panic("this function should not be called!")
	}, func(_ Ref) int {
		panic("this function should not be called!")
	}))
}

func TestQuery(t *testing.T) {
	assert.Equal(t, VersionRefQuery{
		eq: Version("x").OrRef(),
	}, Query().Equal(Version("x").OrRef()))
	assert.Equal(t, VersionRefQuery{
		lt: Version("x").OrRef(),
	}, Query().OlderThan(Version("x").OrRef()))
	assert.Equal(t, VersionRefQuery{
		gt: Version("x").OrRef(),
	}, Query().NewerThan(Version("x").OrRef()))
	assert.Equal(t, VersionRefQuery{
		gt: Version("x").OrRef(),
		lt: Version("y").OrRef(),
	}, Query().Range(Version("x").OrRef(), Version("y").OrRef()))
}

func TestVersionRefQuery_Refs(t *testing.T) {
	assert.Equal(t, []Ref{"a", "b", "c"}, VersionRefQuery{
		eq: Ref("a").OrVersion(),
		gt: Ref("b").OrVersion(),
		lt: Ref("c").OrVersion(),
	}.Refs())
}

func TestVersionRefQuery_Solve(t *testing.T) {
	assert.Equal(t, VersionQuery{
		eq: Version("x"),
		gt: Version("y"),
		lt: Version("z"),
	}, VersionRefQuery{
		eq: Ref("a").OrVersion(),
		gt: Ref("b").OrVersion(),
		lt: Ref("c").OrVersion(),
	}.Solve(Refs{
		"a": "x",
		"b": "y",
		"c": "z",
	}))
}

func TestMatchVersionQuery(t *testing.T) {
	assert.Equal(t, 1, MatchVersionQuery(VersionQuery{
		eq: Version("x"),
	}, VersionQueryMatch[int]{
		Eq: func(v Version) int {
			return 1
		},
		Lt: nil,
		Gt: nil,
	}))
	assert.Equal(t, 1, MatchVersionQuery(VersionQuery{
		lt: Version("y"),
	}, VersionQueryMatch[int]{
		Eq: nil,
		Lt: func(v Version) int {
			assert.Equal(t, Version("y"), v)
			return 1
		},
		Gt:    nil,
		Range: nil,
	}))
	assert.Equal(t, 1, MatchVersionQuery(VersionQuery{
		gt: Version("y"),
	}, VersionQueryMatch[int]{
		Eq: nil,
		Lt: nil,
		Gt: func(v Version) int {
			assert.Equal(t, Version("y"), v)
			return 1
		},
		Range: nil,
	}))
	assert.Equal(t, 1, MatchVersionQuery(VersionQuery{
		gt: Version("y"),
		lt: Version("z"),
	}, VersionQueryMatch[int]{
		Eq: nil,
		Lt: nil,
		Gt: nil,
		Range: func(o, n Version) int {
			assert.Equal(t, Version("y"), o)
			assert.Equal(t, Version("z"), n)
			return 1
		},
	}))
}

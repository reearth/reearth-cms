package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

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

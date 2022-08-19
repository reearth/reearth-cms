package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestQuery(t *testing.T) {
	assert.Equal(t, Query{
		eq: Version("x").OrRef(),
	}, (&Query{}).Equal(Version("x").OrRef()))
	assert.Equal(t, Query{
		lt: Version("x").OrRef(),
	}, (&Query{}).OlderThan(Version("x").OrRef()))
	assert.Equal(t, Query{
		gt: Version("x").OrRef(),
	}, (&Query{}).NewerThan(Version("x").OrRef()))
	assert.Equal(t, Query{
		gt: Version("x").OrRef(),
		lt: Version("y").OrRef(),
	}, (&Query{}).Range(Version("x").OrRef(), Version("y").OrRef()))
}

func TestMatchVersionQuery(t *testing.T) {
	assert.Equal(t, 1, MatchVersionQuery(Query{
		eq: Version("x").OrRef(),
	}, QueryMatch[int]{
		Eq: func(v VersionOrRef) int {
			return 1
		},
	}))
	assert.Equal(t, 1, MatchVersionQuery(Query{
		lt: Version("y").OrRef(),
	}, QueryMatch[int]{
		Eq: nil,
		Lt: func(v VersionOrRef) int {
			assert.Equal(t, Version("y").OrRef(), v)
			return 1
		},
	}))
	assert.Equal(t, 1, MatchVersionQuery(Query{
		gt: Version("y").OrRef(),
	}, QueryMatch[int]{
		Gt: func(v VersionOrRef) int {
			assert.Equal(t, Version("y").OrRef(), v)
			return 1
		},
		Range: nil,
	}))
	assert.Equal(t, 1, MatchVersionQuery(Query{
		gt: Version("y").OrRef(),
		lt: Version("z").OrRef(),
	}, QueryMatch[int]{
		Range: func(o, n VersionOrRef) int {
			assert.Equal(t, Version("y").OrRef(), o)
			assert.Equal(t, Version("z").OrRef(), n)
			return 1
		},
	}))
	assert.Equal(t, 1, MatchVersionQuery(Query{}, QueryMatch[int]{
		Default: func() int {
			return 1
		},
	}))
}

package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestQuery(t *testing.T) {
	vx, vy := New(), New()
	assert.Equal(t, Query{
		eq: vx.OrRef(),
	}, (&Query{}).Equal(vx.OrRef()))
	assert.Equal(t, Query{
		lt: vx.OrRef(),
	}, (&Query{}).OlderThan(vx.OrRef()))
	assert.Equal(t, Query{
		gt: vx.OrRef(),
	}, (&Query{}).NewerThan(vx.OrRef()))
	assert.Equal(t, Query{
		gt: vx.OrRef(),
		lt: vy.OrRef(),
	}, (&Query{}).Range(vx.OrRef(), vy.OrRef()))
}

func TestMatchVersionQuery(t *testing.T) {
	vx, vy, vz := New(), New(), New()
	assert.Equal(t, 1, MatchVersionQuery(Query{
		eq: vx.OrRef(),
	}, QueryMatch[int]{
		Eq: func(v VersionOrRef) int {
			return 1
		},
	}))
	assert.Equal(t, 1, MatchVersionQuery(Query{
		lt: vy.OrRef(),
	}, QueryMatch[int]{
		Eq: nil,
		Lt: func(v VersionOrRef) int {
			assert.Equal(t, vy.OrRef(), v)
			return 1
		},
	}))
	assert.Equal(t, 1, MatchVersionQuery(Query{
		gt: vy.OrRef(),
	}, QueryMatch[int]{
		Gt: func(v VersionOrRef) int {
			assert.Equal(t, vy.OrRef(), v)
			return 1
		},
		Range: nil,
	}))
	assert.Equal(t, 1, MatchVersionQuery(Query{
		gt: vy.OrRef(),
		lt: vz.OrRef(),
	}, QueryMatch[int]{
		Range: func(o, n VersionOrRef) int {
			assert.Equal(t, vy.OrRef(), o)
			assert.Equal(t, vz.OrRef(), n)
			return 1
		},
	}))
	assert.Equal(t, 1, MatchVersionQuery(Query{}, QueryMatch[int]{
		Default: func() int {
			return 1
		},
	}))
}

package version

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestRef_Ref(t *testing.T) {
	assert.Equal(t, lo.ToPtr(Ref("x")), Ref("x").Ref())
}

func TestRef_String(t *testing.T) {
	assert.Equal(t, "x", Ref("x").String())
}

func TestRef_OrVersion(t *testing.T) {
	assert.Equal(t, VersionOrRef{ref: Ref("x")}, Ref("x").OrVersion())
	assert.Equal(t, VersionOrRef{}, Ref("").OrVersion())
}

func TestRefsFrom(t *testing.T) {
	s := RefsFrom("x", "y")
	assert.True(t, s.Has("x"))
	assert.True(t, s.Has("y"))
	assert.False(t, s.Has("z"))
}

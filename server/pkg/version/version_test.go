package version

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

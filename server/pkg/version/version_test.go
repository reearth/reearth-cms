package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestVersion_OrRef(t *testing.T) {
	assert.Equal(t, VersionOrRef{version: Version("x")}, Version("x").OrRef())
	assert.Equal(t, VersionOrRef{}, Zero.OrRef())
}

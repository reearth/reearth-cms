package version

import (
	"testing"

	"github.com/chrispappas/golang-generics-set/set"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestVersion_OrRef(t *testing.T) {
	v := New()
	assert.Equal(t, VersionOrRef{version: v}, v.OrRef())
	assert.Equal(t, VersionOrRef{}, Zero.OrRef())
}

func TestVersion_String(t *testing.T) {
	id := uuid.New()
	v := Version(id)
	assert.Equal(t, id.String(), v.String())
}

func TestVersion_IsZero(t *testing.T) {
	assert.True(t, Version(uuid.UUID{}).IsZero())
	assert.False(t, New().IsZero())
}

func TestVersion_Ref(t *testing.T) {
	v := New()
	assert.Equal(t, &v, v.Ref())
}

func TestNewVersions(t *testing.T) {
	v1, v2 := New(), New()
	assert.Equal(t, set.FromSlice([]Version{v1, v2}), NewVersions(v1, v2))
}

func TestToVersionOrLatestRef(t *testing.T) {
	ver1 := "b3a1e9e4-1c6e-4f56-8f93-1234567890ab"
	ver2 := "invalid-uuid"
	var nilVer *string

	v1 := ParseVersion(&ver1)
	v2 := ParseVersion(&ver2)
	vNil := ParseVersion(nilVer)

	assert.Equal(t, Latest.OrVersion(), ToVersionOrLatestRef(nilVer))
	assert.Equal(t, v1.OrRef(), ToVersionOrLatestRef(&ver1))
	assert.Equal(t, Latest.OrVersion(), ToVersionOrLatestRef(&ver2))
	assert.Nil(t, vNil)
	assert.NotNil(t, v1)
	assert.Nil(t, v2)
}

func TestParseVersion(t *testing.T) {
	ver1 := "b3a1e9e4-1c6e-4f56-8f93-1234567890ab"
	ver2 := "invalid-uuid"
	var nilVer *string

	v1 := ParseVersion(&ver1)
	v2 := ParseVersion(&ver2)
	vNil := ParseVersion(nilVer)

	assert.NotNil(t, v1)
	assert.Nil(t, v2)
	assert.Nil(t, vNil)
	assert.Equal(t, Version(uuid.MustParse(ver1)).Ref(), v1)
}

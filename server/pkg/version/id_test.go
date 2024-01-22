package version

import (
	"testing"

	"github.com/chrispappas/golang-generics-set/set"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestVersion_OrRef(t *testing.T) {
	v := NewID()
	assert.Equal(t, IDOrRef{version: v}, v.OrRef())
	assert.Equal(t, IDOrRef{}, Zero.OrRef())
}

func TestVersion_String(t *testing.T) {
	id := uuid.New()
	v := ID(id)
	assert.Equal(t, id.String(), v.String())
}

func TestVersion_IsZero(t *testing.T) {
	assert.True(t, ID(uuid.UUID{}).IsZero())
	assert.False(t, NewID().IsZero())
}

func TestVersion_Ref(t *testing.T) {
	v := NewID()
	assert.Equal(t, &v, v.Ref())
}

func TestNewVersions(t *testing.T) {
	v1, v2 := NewID(), NewID()
	assert.Equal(t, set.FromSlice([]ID{v1, v2}), NewIDs(v1, v2))
}

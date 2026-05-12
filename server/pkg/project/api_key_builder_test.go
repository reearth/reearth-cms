package project

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAccessKeyBuilder(t *testing.T) {
	id := NewAPIKeyID()
	name := "Test Key"
	desc := "A test access key"
	key := "key123"
	models := ModelIDList{NewModelID(), NewModelID()}
	publicAssets := true
	ps := NewPublicationSettings(models, publicAssets)

	at := NewAPIKeyBuilder().
		ID(id).
		Name(name).
		Description(desc).
		Key(key).
		Publication(ps).
		Build()

	assert.NotNil(t, at)
	assert.Equal(t, id, at.ID())
	assert.Equal(t, name, at.Name())
	assert.Equal(t, desc, at.Description())
	assert.Equal(t, key, at.Key())
	assert.Equal(t, ps, at.Publication())
}

func TestAccessKeyBuilder_CloneIndependence(t *testing.T) {
	id := NewAPIKeyID()
	at1 := NewAPIKeyBuilder().ID(id).Build()
	at2 := NewAPIKeyBuilder().ID(id).Build()

	assert.NotSame(t, at1, at2)
	assert.Equal(t, at1.ID(), at2.ID())
}

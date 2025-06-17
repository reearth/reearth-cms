package project

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAccessibility_NewAndGetters(t *testing.T) {
	models := ModelIDList{NewModelID(), NewModelID()}
	ps := NewPublicationSettings(models, false)
	keys := APIKeys{
		NewAPIKeyBuilder().NewID().Name("key1").Build(),
		NewAPIKeyBuilder().NewID().Name("key2").Build(),
	}
	pub := NewAccessibility(VisibilityPrivate, ps, keys)

	assert.Equal(t, VisibilityPrivate, pub.Visibility())
	assert.Equal(t, ps, pub.Publication())
	assert.Equal(t, keys[0].ID(), pub.ApiKeys()[0].ID())
	assert.Equal(t, keys[1].ID(), pub.ApiKeys()[1].ID())
}

func TestAccessibility_DefaultVisibility(t *testing.T) {
	pub := NewAccessibility("", &PublicationSettings{}, nil)
	assert.Equal(t, VisibilityPublic, pub.Visibility())
}

func TestAccessibility_Setters(t *testing.T) {
	models := ModelIDList{NewModelID()}
	ps := NewPublicationSettings(models, true)
	pub := NewAccessibility(VisibilityPublic, ps, nil)
	keys := APIKeys{NewAPIKeyBuilder().NewID().Name("key").Build()}

	pub.SetVisibility(VisibilityPrivate)
	assert.Equal(t, VisibilityPrivate, pub.Visibility())

	pub.SetPublication(ps)
	assert.Equal(t, ps.PublicModels(), pub.Publication().PublicModels())

	pub.SetPublication(nil)
	assert.Nil(t, pub.Publication())

	pub.SetAPIKeys(keys)
	assert.Equal(t, keys[0].ID(), pub.ApiKeys()[0].ID())
}

func TestAccessibility_AddRemoveUpdateKey(t *testing.T) {
	ps := NewPublicationSettings(ModelIDList{NewModelID()}, true)
	pub := NewAccessibility(VisibilityPublic, ps, nil)
	key := NewAPIKeyBuilder().NewID().Name("key").Build()

	// Add
	pub.AddAPIKey(*key)
	assert.Len(t, pub.ApiKeys(), 1)
	assert.Equal(t, key.ID(), pub.ApiKeys()[0].ID())

	// Update
	updated := key.Clone()
	updated.SetName("updated")
	pub.UpdateAPIKey(*updated)
	assert.Equal(t, "updated", pub.ApiKeys()[0].Name())

	// Remove
	pub.RemoveAPIKey(key.ID())
	assert.Len(t, pub.ApiKeys(), 0)
}

func TestAccessibility_Clone(t *testing.T) {
	models := ModelIDList{NewModelID()}
	ps := NewPublicationSettings(models, true)
	keys := APIKeys{NewAPIKeyBuilder().NewID().Name("key").Build()}
	pub := NewAccessibility(VisibilityPrivate, ps, keys)

	clone := pub.Clone()
	assert.NotSame(t, pub, clone)
	assert.Equal(t, pub.Visibility(), clone.Visibility())
	assert.Equal(t, pub.Publication(), clone.Publication())
	assert.Equal(t, pub.ApiKeys()[0].ID(), clone.ApiKeys()[0].ID())
}

func TestAccessibility_NilReceivers(t *testing.T) {
	var pub *Accessibility

	assert.Equal(t, VisibilityPublic, pub.Visibility())
	assert.Nil(t, pub.ApiKeys())
	assert.Nil(t, pub.Publication())
}

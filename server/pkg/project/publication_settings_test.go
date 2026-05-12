package project

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewPublicationSettings(t *testing.T) {
	models := ModelIDList{NewModelID(), NewModelID()}
	ps := NewPublicationSettings(models, true)
	assert.NotNil(t, ps)
	assert.Equal(t, models, ps.PublicModels())
	assert.True(t, ps.PublicAssets())
}

func TestPublicationSettings_PublicModels(t *testing.T) {
	models := ModelIDList{NewModelID()}
	ps := NewPublicationSettings(models, false)
	got := ps.PublicModels()
	assert.Equal(t, models, got)
	// Ensure clone
	got[0] = NewModelID()
	assert.NotEqual(t, ps.PublicModels()[0], got[0])

	var nilPS *PublicationSettings
	assert.Nil(t, nilPS.PublicModels())
}

func TestPublicationSettings_PublicAssets(t *testing.T) {
	ps := NewPublicationSettings(nil, false)
	assert.False(t, ps.PublicAssets())

	var nilPS *PublicationSettings
	assert.True(t, nilPS.PublicAssets())
}

func TestPublicationSettings_Clone(t *testing.T) {
	models := ModelIDList{NewModelID()}
	ps := NewPublicationSettings(models, true)
	clone := ps.Clone()
	assert.NotSame(t, ps, clone)
	assert.Equal(t, ps.PublicModels(), clone.PublicModels())
	assert.Equal(t, ps.PublicAssets(), clone.PublicAssets())

	var nilPS *PublicationSettings
	assert.Nil(t, nilPS.Clone())
}

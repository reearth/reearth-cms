package project

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAccessKey_GettersSetters(t *testing.T) {
	id := NewAPIKeyID()
	name := "key name"
	desc := "key desc"
	key := "tok"
	models := ModelIDList{NewModelID()}
	publicAssets := true
	ps := NewPublicationSettings(models, publicAssets)

	at := &APIKey{}
	at.id = id
	at.SetName(name)
	at.SetDescription(desc)
	at.SetKey(key)
	at.SetPublication(*ps)

	assert.Equal(t, id, at.ID())
	assert.Equal(t, name, at.Name())
	assert.Equal(t, desc, at.Description())
	assert.Equal(t, key, at.Key())
	assert.Equal(t, ps, at.Publication())
}

func TestAccessKey_Clone(t *testing.T) {
	at := &APIKey{
		id:          NewAPIKeyID(),
		name:        "n",
		desc:        "d",
		key:         "t",
		publication: NewPublicationSettings(ModelIDList{NewModelID()}, true),
	}
	clone := at.Clone()
	assert.NotSame(t, at, clone)
	assert.Equal(t, at.id, clone.id)
	assert.Equal(t, at.name, clone.name)
	assert.Equal(t, at.desc, clone.desc)
	assert.Equal(t, at.key, clone.key)
	assert.Equal(t, at.publication, clone.publication)
}

func TestAccessKey_GenerateKey(t *testing.T) {
	at := &APIKey{}
	at.GenerateKey()
	assert.NotEmpty(t, at.Key())
	assert.Len(t, at.Key(), 50)
	assert.Regexp(t, "^secret_[0-9a-zA-Z]{43}$", at.Key())
}

func TestAccessKeys_Clone(t *testing.T) {
	at1 := &APIKey{id: NewAPIKeyID()}
	at2 := &APIKey{id: NewAPIKeyID()}
	ats := APIKeys{at1, at2}
	cloned := ats.Clone()
	assert.Len(t, cloned, 2)
	assert.NotSame(t, ats[0], cloned[0])
	assert.Equal(t, ats[0].id, cloned[0].id)
}

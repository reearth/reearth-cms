package mongodoc

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewValue(t *testing.T) {
	assert.Nil(t, NewValue(nil))
	assert.Equal(t, &ValueDocument{
		Type: "bool",
		V:    true,
	}, NewValue(value.TypeBool.Value(true)))
}

func TestNewOptionalValue(t *testing.T) {
	assert.Nil(t, NewValue(nil))
	assert.Equal(t, &ValueDocument{
		Type: "bool",
	}, NewOptionalValue(value.TypeBool.None()))
	assert.Equal(t, &ValueDocument{
		Type: "bool",
		V:    true,
	}, NewOptionalValue(value.TypeBool.Value(true).Some()))
}

package mongodoc

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewMultipleValue(t *testing.T) {
	assert.Nil(t, NewMultipleValue(nil))
	assert.Equal(t, &ValueDocument{
		T: "bool",
		V: []any{},
	}, NewMultipleValue(value.MultipleFrom(value.TypeBool, nil)))
	assert.Equal(t, &ValueDocument{
		T: "bool",
		V: []any{true},
	}, NewMultipleValue(value.MultipleFrom(value.TypeBool, []*value.Value{value.TypeBool.Value(true)})))
}

package publicapi

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsGeometry(t *testing.T) {
	var v1 interface{} = "test"
	g1, ok1 := isGeometry(v1)
	assert.Nil(t, g1)
	assert.False(t, ok1)
	var v2 interface{} = 1
	g2, ok2 := isGeometry(v2)
	assert.Nil(t, g2)
	assert.False(t, ok2)
	var v3 interface{} = "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}"
	g3, ok3 := isGeometry(v3)
	assert.NotNil(t, g3)
	assert.True(t, ok3)
}
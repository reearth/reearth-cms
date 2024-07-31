package publicapi

import (
	"testing"

	"github.com/samber/lo"
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
	var v4 interface{} = []interface{}{
		"{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
		"{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}",
	}
	g4, ok4 := isGeometry(v4)
	want4, err := g4.Coordinates.AsPoint()
	assert.NoError(t, err)
	assert.NotNil(t, g4)
	assert.Equal(t, lo.ToPtr(GeometryTypePoint), g4.Type)
	assert.Equal(t, []float64{102.0, 0.5}, want4)
	assert.True(t, ok4)
}

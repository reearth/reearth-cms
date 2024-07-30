package publicapi

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExtractFirstPointField(t *testing.T) {
	itm1 := Item{
		ID: "test",
		Fields: map[string]interface{}{
			"name":   "test",
			"age":    30,
			"point1": "{\n\"type\": \"Point\",\n\t\"coordinates\": [102.0, 0.5]\n}",
			"point2": "{\n\"type\": \"Point\",\n\t\"coordinates\": [103.0, 1.5]\n}",
		},
	}
	c1, ok1 := extractFirstPointField(itm1)
	want1 := []float64{102.0, 0.5}
	assert.True(t, ok1)
	assert.Equal(t, want1, c1)

	itm2 := Item{
		ID: "test",
		Fields: map[string]interface{}{
			"name":    "test",
			"age":     30,
			"married": true,
		},
	}
	c2, ok2 := extractFirstPointField(itm2)
	assert.False(t, ok2)
	assert.Nil(t, c2)
}

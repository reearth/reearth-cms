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

func TestToCSVValue(t *testing.T) {
	v1 := "test"
	c1 := toCSVValue(v1)
	assert.Equal(t, "test", c1)

	var v2 int64 = 1
	c2 := toCSVValue(v2)
	assert.Equal(t, "1", c2)

	var v3 float64 = 1.1
	c3 := toCSVValue(v3)
	assert.Equal(t, "1.1", c3)

	v4 := true
	c4 := toCSVValue(v4)
	assert.Equal(t, "true", c4)

	v5 := false
	c5 := toCSVValue(v5)
	assert.Equal(t, "false", c5)

	var v6 interface{}
	c6 := toCSVValue(v6)
	assert.Equal(t, "", c6)
}

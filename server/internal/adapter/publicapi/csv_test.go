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
	var v1 interface{} = "test"
	c1 := toCSVValue(v1)
	assert.Equal(t, "test", c1)

	var v2 interface{} = int64(1)
	c2 := toCSVValue(v2)
	assert.Equal(t, "1", c2)

	var v3 interface{} = 1.1
	c3 := toCSVValue(v3)
	assert.Equal(t, "1.1", c3)

	var v4 interface{} = true
	c4 := toCSVValue(v4)
	assert.Equal(t, "true", c4)

	var v5 interface{} = false
	c5 := toCSVValue(v5)
	assert.Equal(t, "false", c5)

	var v6 interface{}
	c6 := toCSVValue(v6)
	assert.Equal(t, "", c6)

	var v7 interface{} = []interface{}{int64(36), int64(29)}
	c7 := toCSVValue(v7)
	assert.Equal(t, "36", c7)

	var v8 interface{} = []interface{}{false, true}
	c8 := toCSVValue(v8)
	assert.Equal(t, "false", c8)
}

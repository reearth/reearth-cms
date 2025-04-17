package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/stretchr/testify/assert"
)

func TestToGuessSchemaFieldData(t *testing.T) {
	tests := []struct {
		name     string
		input    *interfaces.GuessSchemaFieldsData
		expected *GuessSchemaFieldResult
	}{
		{
			name:     "nil input returns nil",
			input:    nil,
			expected: nil,
		},
		{
			name: "empty fields returns empty result",
			input: &interfaces.GuessSchemaFieldsData{
				Fields:     []interfaces.GuessSchemaField{},
				TotalCount: 0,
			},
			expected: &GuessSchemaFieldResult{
				TotalCount: 0,
				Fields:     []*GuessSchemaField{},
			},
		},
		{
			name: "valid input returns mapped result",
			input: &interfaces.GuessSchemaFieldsData{
				Fields: []interfaces.GuessSchemaField{
					{Name: "Field A", Key: "field-a", Type: "Text"},
					{Name: "Field B", Key: "field-b", Type: "Integer"},
				},
				TotalCount: 2,
			},
			expected: &GuessSchemaFieldResult{
				TotalCount: 2,
				Fields: []*GuessSchemaField{
					{Name: "Field A", Key: "field-a", Type: "Text"},
					{Name: "Field B", Key: "field-b", Type: "Integer"},
				},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			actual := ToGuessSchemaFieldData(tt.input)
			assert.Equal(t, tt.expected, actual)
		})
	}
}

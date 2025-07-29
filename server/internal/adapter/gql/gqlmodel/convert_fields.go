package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/samber/lo"
)

func ToGuessSchemaFieldData(data *interfaces.GuessSchemaFieldsData) *GuessSchemaFieldResult {
	// Return nil if input is nil
	if data == nil {
		return nil
	}

	return &GuessSchemaFieldResult{
		TotalCount: data.TotalCount,
		Fields: lo.Map(data.Fields, func(f interfaces.GuessSchemaField, _ int) *GuessSchemaField {
			return &GuessSchemaField{
				Name: f.Name,
				Key:  f.Key,
				Type: f.Type,
			}
		}),
	}
}

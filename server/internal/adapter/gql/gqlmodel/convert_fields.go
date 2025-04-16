package gqlmodel

import "github.com/reearth/reearth-cms/server/internal/usecase/interfaces"

func AssetsToGuessSchemaFieldData(data *interfaces.GuessSchemaFieldsData) *GuessSchemaFieldResult {
	// Return nil if input is nil
	if data == nil {
		return nil
	}

	result := &GuessSchemaFieldResult{
		TotalCount: data.TotalCount,
		Fields:     make([]*GuessSchemaField, 0, len(data.Fields)),
	}

	for _, f := range data.Fields {
		result.Fields = append(result.Fields, &GuessSchemaField{
			Name: f.Name,
			Key:  f.Key,
			Type: f.Type,
		})
	}

	return result
}

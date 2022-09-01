package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/model"
)

func ToModel(m *model.Model) *Model {
	if m == nil {
		return nil
	}

	return &Model{
		ID:          IDFrom(m.ID()),
		ProjectID:   IDFrom(m.Project()),
		SchemaID:    IDFrom(m.Schema()),
		Name:        m.Name(),
		Description: m.Description(),
		Key:         m.Key().String(),
		Project:     nil,
		Schema:      nil,
		CreatedAt:   m.ID().Timestamp(),
		UpdatedAt:   m.UpdatedAt(),
	}
}

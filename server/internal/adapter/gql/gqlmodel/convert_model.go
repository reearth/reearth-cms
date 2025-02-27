package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/samber/lo"
)

func ToModel(m *model.Model) *Model {
	if m == nil {
		return nil
	}

	return &Model{
		ID:               IDFrom(m.ID()),
		ProjectID:        IDFrom(m.Project()),
		SchemaID:         IDFrom(m.Schema()),
		Name:             m.Name(),
		Description:      m.Description(),
		Key:              m.Key().String(),
		MetadataSchemaID: IDFromRef(m.Metadata()),
		Public:           m.Public(),
		CreatedAt:        m.ID().Timestamp(),
		UpdatedAt:        m.UpdatedAt(),
		Order:            lo.ToPtr(m.Order()),
	}
}

func ToModelSortOptions(s *ModelSortOptions) *model.Sort {
	if s == nil {
		return nil
	}
	column := ToModelSortColumn(s.Column)
	direction := ToModelSortDirection(s.Direction)
	return &model.Sort{
		Column:    column,
		Direction: direction,
	}
}

func ToModelSortDirection(s *SortDirection) model.Direction {
	if s != nil && *s == SortDirectionAsc {
		return model.DirectionAsc
	}
	return model.DirectionDesc
}

func ToModelSortColumn(s ModelSortColumn) model.Column {
	if s == ModelSortColumnCreatedAt {
		return model.ColumnCreatedAt
	}
	return model.ColumnUpdatedAt
}

package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/exporters"
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
		CreatedAt:        m.ID().Timestamp(),
		UpdatedAt:        m.UpdatedAt(),
		Order:            lo.ToPtr(m.Order()),
	}
}

func ToExportFormat(f ExportFormat) exporters.ExportFormat {
	switch f {
	case ExportFormatJSON:
		return exporters.FormatJSON
	case ExportFormatCSV:
		return exporters.FormatCSV
	case ExportFormatGeojson:
		return exporters.FormatGeoJSON
	default:
		return exporters.FormatJSON
	}
}

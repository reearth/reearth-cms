package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToModel(t *testing.T) {
	t.Parallel()

	mId := model.NewID()
	pId := project.NewID()
	sId := schema.NewID()
	k := id.RandomKey()
	tests := []struct {
		name  string
		model *model.Model
		want  *Model
	}{
		{
			name:  "nil",
			model: nil,
			want:  nil,
		},
		{
			name: "postingEnabled false",
			model: model.New().ID(mId).Project(pId).Schema(sId).Key(k).
				Name("N1").Description("D1").Order(1).PostingEnabled(false).MustBuild(),
			want: &Model{
				ID:              IDFrom(mId),
				ProjectID:       IDFrom(pId),
				SchemaID:        IDFrom(sId),
				Name:            "N1",
				Description:     "D1",
				Key:             k.String(),
				Project:         nil,
				Schema:          nil,
				CreatedAt:       mId.Timestamp(),
				UpdatedAt:       mId.Timestamp(),
				Order:           lo.ToPtr(1),
				PostingSettings: &ModelPostingSettings{Enabled: false},
			},
		},
		{
			name: "postingEnabled true",
			model: model.New().ID(mId).Project(pId).Schema(sId).Key(k).
				Name("N1").Description("D1").Order(1).PostingEnabled(true).MustBuild(),
			want: &Model{
				ID:              IDFrom(mId),
				ProjectID:       IDFrom(pId),
				SchemaID:        IDFrom(sId),
				Name:            "N1",
				Description:     "D1",
				Key:             k.String(),
				Project:         nil,
				Schema:          nil,
				CreatedAt:       mId.Timestamp(),
				UpdatedAt:       mId.Timestamp(),
				Order:           lo.ToPtr(1),
				PostingSettings: &ModelPostingSettings{Enabled: true},
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := ToModel(tt.model)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestToExportFormat(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		input ExportFormat
		want  exporters.ExportFormat
	}{
		{name: "JSON", input: ExportFormatJSON, want: exporters.FormatJSON},
		{name: "CSV", input: ExportFormatCSV, want: exporters.FormatCSV},
		{name: "GeoJSON", input: ExportFormatGeojson, want: exporters.FormatGeoJSON},
		{name: "unknown defaults to JSON", input: ExportFormat("UNKNOWN"), want: exporters.FormatJSON},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, ToExportFormat(tt.input))
		})
	}
}

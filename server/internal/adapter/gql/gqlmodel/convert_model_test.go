package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"

	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/stretchr/testify/assert"
)

func TestToModel(t *testing.T) {
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
			name: "success",
			model: model.New().ID(mId).Project(pId).Schema(sId).Key(k).
				Name("N1").Description("D1").Order(1).MustBuild(),
			want: &Model{
				ID:          IDFrom(mId),
				ProjectID:   IDFrom(pId),
				SchemaID:    IDFrom(sId),
				Name:        "N1",
				Description: "D1",
				Key:         k.String(),
				Project:     nil,
				Schema:      nil,
				CreatedAt:   mId.Timestamp(),
				UpdatedAt:   mId.Timestamp(),
				Order:       lo.ToPtr(1),
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			got := ToModel(tt.model)
			assert.Equal(t, tt.want, got)
		})
	}
}

package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/stretchr/testify/assert"
)

func TestToGroup(t *testing.T) {
	mId := group.NewID()
	pId := project.NewID()
	sId := schema.NewID()
	k := id.RandomKey()
	tests := []struct {
		name  string
		group *group.Group
		want  *Group
	}{
		{
			name:  "nil",
			group: nil,
			want:  nil,
		},
		{
			name: "success",
			group: group.New().ID(mId).Project(pId).Schema(sId).Key(k).
				Name("N1").Description("D1").Order(1).MustBuild(),
			want: &Group{
				ID:          IDFrom(mId),
				ProjectID:   IDFrom(pId),
				SchemaID:    IDFrom(sId),
				Name:        "N1",
				Description: "D1",
				Key:         k.String(),
				Project:     nil,
				Schema:      nil,
				Order:       1,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			got := ToGroup(tt.group)
			assert.Equal(t, tt.want, got)
		})
	}
}

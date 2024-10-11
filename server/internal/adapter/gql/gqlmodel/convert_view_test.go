package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/stretchr/testify/assert"
)

func TestToView(t *testing.T) {
	vId := view.NewID()
	pId := project.NewID()
	mId := model.NewID()
	tests := []struct {
		name string
		view *view.View
		want *View
	}{
		{
			name: "nil",
			view: nil,
			want: nil,
		},
		{
			name: "success",
			view: view.New().ID(vId).Project(pId).Model(mId).
				Name("N1").Order(1).MustBuild(),
			want: &View{
				ID:        IDFrom(vId),
				ProjectID: IDFrom(pId),
				ModelID:   IDFrom(mId),
				Name:      "N1",
				Order:     1,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			got := ToView(tt.view)
			assert.Equal(t, tt.want, got)
		})
	}
}

package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestView_UpdateOrder(t *testing.T) {
	t.Parallel()
	p1, p2 := id.NewProjectID(), id.NewProjectID()
	newView := func(pid id.ProjectID) *view.View {
		return view.New().NewID().Project(pid).Model(id.NewModelID()).Schema(id.NewSchemaID()).
			User(accountdomain.NewUserID()).MustBuild()
	}
	p1v1, p2v1 := newView(p1), newView(p2)

	tests := []struct {
		name   string
		filter *repo.ProjectFilter
		args   view.IDList
	}{
		{
			name: "must not find only unknown views",
			args: view.IDList{id.NewViewID()},
		},
		{
			name: "must not find a list that includes an unknown view",
			args: view.IDList{p1v1.ID(), id.NewViewID()},
		},
		{
			name:   "must not find views of unreadable projects",
			filter: &repo.ProjectFilter{Readable: id.ProjectIDList{p1}, Writable: id.ProjectIDList{p1}},
			args:   view.IDList{p2v1.ID()},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()

			db := memory.New()
			require.NoError(t, db.View.SaveAll(ctx, view.List{p1v1, p2v1}))
			if tc.filter != nil {
				db.View = db.View.Filtered(*tc.filter)
			}
			op := &usecase.Operator{
				OwningProjects: id.ProjectIDList{p1, p2},
				AcOperator:     &accountusecase.Operator{User: accountdomain.NewUserID().Ref()},
			}

			got, err := NewView(db, nil).UpdateOrder(ctx, tc.args, op)
			assert.Equal(t, rerror.ErrNotFound, err)
			assert.Nil(t, got)
		})
	}
}

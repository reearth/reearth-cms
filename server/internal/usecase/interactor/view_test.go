package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
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

func TestView_Update(t *testing.T) {
	t.Parallel()

	pid := id.NewProjectID()
	basic := func(v any) *view.Condition {
		return &view.Condition{ConditionType: view.ConditionTypeBasic, BasicCondition: &view.BasicCondition{Value: v}}
	}
	v := view.New().NewID().Project(pid).Model(id.NewModelID()).Schema(id.NewSchemaID()).
		User(accountdomain.NewUserID()).Name("view").Filter(basic("old")).MustBuild()
	sort := &view.Sort{Field: view.FieldSelector{Type: view.FieldTypeId}, Direction: view.DirectionDesc}

	tests := []struct {
		name       string
		args       interfaces.UpdateViewParam
		operator   *usecase.Operator
		wantName   string
		wantFilter *view.Condition
		wantSort   *view.Sort
		wantErr    error
	}{
		{
			name:       "must update the name, filter and sort",
			args:       interfaces.UpdateViewParam{ID: v.ID(), Name: new("renamed"), Filter: basic("new"), Sort: sort},
			wantName:   "renamed",
			wantFilter: basic("new"),
			wantSort:   sort,
		},
		{
			name:     "must clear the filter",
			args:     interfaces.UpdateViewParam{ID: v.ID()},
			wantName: "view",
		},
		{
			name: "must reject an invalid condition in the filter",
			args: interfaces.UpdateViewParam{ID: v.ID(), Filter: &view.Condition{
				ConditionType: view.ConditionTypeAnd,
				AndCondition:  &view.AndCondition{Conditions: []view.Condition{*basic("new"), {}}},
			}},
			wantErr: view.ErrInvalidCondition,
		},
		{
			name:    "must not update an unknown view",
			args:    interfaces.UpdateViewParam{ID: id.NewViewID(), Name: new("renamed")},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:     "must not update a view of a project the operator doesn't maintain",
			args:     interfaces.UpdateViewParam{ID: v.ID(), Name: new("renamed")},
			operator: &usecase.Operator{AcOperator: &accountusecase.Operator{User: accountdomain.NewUserID().Ref()}},
			wantErr:  interfaces.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()

			db := memory.New()
			require.NoError(t, db.View.Save(ctx, v))
			op := tc.operator
			if op == nil {
				op = &usecase.Operator{
					OwningProjects: id.ProjectIDList{pid},
					AcOperator:     &accountusecase.Operator{User: accountdomain.NewUserID().Ref()},
				}
			}

			got, err := NewView(db, nil).Update(ctx, tc.args.ID, tc.args, op)
			stored, serr := db.View.FindByID(ctx, v.ID())
			require.NoError(t, serr)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				assert.Nil(t, got)
				// the stored view is unchanged
				assert.Equal(t, v, stored)
				return
			}

			require.NoError(t, err)
			assert.Equal(t, tc.wantName, got.Name())
			assert.Equal(t, tc.wantFilter, got.Filter())
			assert.Equal(t, tc.wantSort, got.Sort())
			assert.Equal(t, got, stored)
		})
	}
}

package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestRequestRepo(t *testing.T) {
	repotest.TestRequestRepo(t, func(*testing.T) repo.Request {
		return NewRequest()
	})
}

func TestRequest_MemorySpecific_Errors(t *testing.T) {
	ctx := context.Background()
	wantErr := errors.New("test")
	item := lo.Must(request.NewItemWithVersion(id.NewItemID(), version.New().OrRef()))
	req := request.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).
		CreatedBy(accountdomain.NewUserID()).Items(request.ItemList{item}).Title("title").MustBuild()
	pagination := usecasex.CursorPagination{First: new(int64(10))}.Wrap()

	r := NewRequest()
	assert.NoError(t, r.Save(ctx, req))
	SetRequestError(r, wantErr)
	// the error survives filtering
	r = r.Filtered(repo.ProjectFilter{})

	err := func(rets ...any) error { return rets[len(rets)-1].(error) }

	assert.Same(t, wantErr, err(r.FindByID(ctx, req.ID())))
	assert.Same(t, wantErr, err(r.FindByIDs(ctx, id.RequestIDList{req.ID()})))
	assert.Same(t, wantErr, err(r.FindByProject(ctx, req.Project(), repo.RequestFilter{}, nil, pagination)))
	assert.Same(t, wantErr, err(r.FindByItems(ctx, req.Items().IDs(), nil)))
	assert.Same(t, wantErr, err(r.Save(ctx, req)))
	assert.Same(t, wantErr, err(r.SaveAll(ctx, req.Project(), request.List{req})))
}

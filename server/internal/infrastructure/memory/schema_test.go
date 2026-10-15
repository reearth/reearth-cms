package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestSchemaRepo(t *testing.T) {
	repotest.TestSchemaRepo(t, func(*testing.T) repo.Schema {
		return NewSchema()
	})
}

func TestSchema_MemorySpecific_Errors(t *testing.T) {
	ctx := context.Background()
	wantErr := errors.New("test")
	s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).MustBuild()

	r := NewSchema()
	assert.NoError(t, r.Save(ctx, s))
	SetSchemaError(r, wantErr)
	// the error survives filtering
	r = r.Filtered(repo.WorkspaceFilter{})

	err := func(rets ...any) error { return rets[len(rets)-1].(error) }

	assert.Same(t, wantErr, err(r.FindByID(ctx, s.ID())))
	assert.Same(t, wantErr, err(r.FindByIDs(ctx, id.SchemaIDList{s.ID()})))
	assert.Same(t, wantErr, err(r.Save(ctx, s)))
	assert.Same(t, wantErr, err(r.SaveAll(ctx, schema.List{s})))
	assert.Same(t, wantErr, err(r.Remove(ctx, s.ID())))
}

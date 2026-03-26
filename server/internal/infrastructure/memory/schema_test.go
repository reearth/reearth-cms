package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestSchemaRepo_SaveAll(t *testing.T) {
	t.Parallel()

	wid := accountdomain.NewWorkspaceID()

	t.Run("saves all schemas", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		r := NewSchema()

		s1 := newTestSchema(wid)
		s2 := newTestSchema(wid)

		assert.NoError(t, r.SaveAll(ctx, schema.List{s1, s2}))

		got1, err := r.FindByID(ctx, s1.ID())
		assert.NoError(t, err)
		assert.Equal(t, s1, got1)

		got2, err := r.FindByID(ctx, s2.ID())
		assert.NoError(t, err)
		assert.Equal(t, s2, got2)
	})

	t.Run("skips nil entries", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		r := NewSchema()

		s1 := newTestSchema(wid)
		assert.NoError(t, r.SaveAll(ctx, schema.List{s1, nil}))

		got, err := r.FindByID(ctx, s1.ID())
		assert.NoError(t, err)
		assert.Equal(t, s1, got)
	})

	t.Run("empty list is a no-op", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		r := NewSchema()
		assert.NoError(t, r.SaveAll(ctx, schema.List{}))
	})

	t.Run("operation denied when workspace not writable", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()

		other := accountdomain.NewWorkspaceID()
		r := NewSchema().Filtered(repo.WorkspaceFilter{
			Readable: id.WorkspaceIDList{wid},
			Writable: id.WorkspaceIDList{wid},
		})

		s := newTestSchema(other) // belongs to a different workspace
		assert.ErrorIs(t, r.SaveAll(ctx, schema.List{s}), repo.ErrOperationDenied)
	})

	t.Run("no partial save on permission error", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()

		other := accountdomain.NewWorkspaceID()
		r := NewSchema().Filtered(repo.WorkspaceFilter{
			Readable: id.WorkspaceIDList{wid},
			Writable: id.WorkspaceIDList{wid},
		})

		s1 := newTestSchema(wid)
		sBad := newTestSchema(other)

		err := r.SaveAll(ctx, schema.List{s1, sBad})
		assert.ErrorIs(t, err, repo.ErrOperationDenied)

		// s1 must NOT have been saved (two-pass validation prevents partial writes)
		_, err2 := r.FindByID(ctx, s1.ID())
		assert.Error(t, err2)
	})
}

func newTestSchema(wid accountdomain.WorkspaceID) *schema.Schema {
	pid := id.NewProjectID()
	s, err := schema.New().NewID().Workspace(wid).Project(pid).Build()
	if err != nil {
		panic(err)
	}
	return s
}
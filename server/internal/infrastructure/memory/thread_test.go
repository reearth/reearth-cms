package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestThreadRepo(t *testing.T) {
	repotest.TestThreadRepo(t, func(*testing.T) repo.Thread {
		return NewThread()
	})
}

func TestThread_MemorySpecific_Errors(t *testing.T) {
	ctx := context.Background()
	wantErr := errors.New("test")
	th := thread.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild()

	r := NewThread()
	assert.NoError(t, r.Save(ctx, th))
	SetThreadError(r, wantErr)
	// the error survives filtering
	r = r.Filtered(repo.WorkspaceFilter{})

	err := func(rets ...any) error { return rets[len(rets)-1].(error) }

	assert.Same(t, wantErr, err(r.FindByID(ctx, th.ID())))
	assert.Same(t, wantErr, err(r.FindByIDs(ctx, id.ThreadIDList{th.ID()})))
	assert.Same(t, wantErr, err(r.Save(ctx, th)))
	assert.Same(t, wantErr, err(r.SaveAll(ctx, thread.List{th})))
	assert.Same(t, wantErr, err(r.Remove(ctx, th.ID())))
	assert.Same(t, wantErr, err(r.RemoveByIDs(ctx, id.ThreadIDList{th.ID()})))
}

package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/util"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestNewWorkspace(t *testing.T) {
	expected := &Workspace{
		data: &util.SyncMap[id.WorkspaceID, *user.Workspace]{},
	}
	got := NewWorkspace()
	assert.Equal(t, expected, got)
}

func TestWorkspace_FindByID(t *testing.T) {
	ctx := context.Background()
	ws := user.NewWorkspace().NewID().Name("hoge").MustBuild()
	r := &Workspace{
		data: &util.SyncMap[id.WorkspaceID, *user.Workspace]{},
	}
	r.data.Store(ws.ID(), ws)
	out, err := r.FindByID(ctx, ws.ID())
	assert.NoError(t, err)
	assert.Equal(t, ws, out)

	out2, err := r.FindByID(ctx, id.WorkspaceID{})
	assert.Nil(t, out2)
	assert.Same(t, rerror.ErrNotFound, err)
}

func TestWorkspace_FindByIDs(t *testing.T) {
	ctx := context.Background()
	ws := user.NewWorkspace().NewID().Name("hoge").MustBuild()
	ws2 := user.NewWorkspace().NewID().Name("foo").MustBuild()
	r := &Workspace{
		data: &util.SyncMap[id.WorkspaceID, *user.Workspace]{},
	}
	r.data.Store(ws.ID(), ws)
	r.data.Store(ws2.ID(), ws2)

	ids := user.WorkspaceIDList{ws.ID()}
	wsl := user.WorkspaceList{ws}
	out, err := r.FindByIDs(ctx, ids)
	assert.NoError(t, err)
	assert.Equal(t, wsl, out)
}

func TestWorkspace_FindByUser(t *testing.T) {
	ctx := context.Background()
	u := user.New().NewID().Email("aaa@bbb.com").MustBuild()
	ws := user.NewWorkspace().NewID().Name("hoge").Members(map[user.ID]user.Role{u.ID(): user.RoleOwner}).MustBuild()
	r := &Workspace{
		data: &util.SyncMap[id.WorkspaceID, *user.Workspace]{},
	}
	r.data.Store(ws.ID(), ws)
	wsl := user.WorkspaceList{ws}
	out, err := r.FindByUser(ctx, u.ID())
	assert.NoError(t, err)
	assert.Equal(t, wsl, out)

	out2, err := r.FindByUser(ctx, id.UserID{})
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, out2)

}

func TestWorkspace_Remove(t *testing.T) {
	ctx := context.Background()
	ws := user.NewWorkspace().NewID().Name("hoge").MustBuild()
	ws2 := user.NewWorkspace().NewID().Name("foo").MustBuild()
	r := &Workspace{
		data: &util.SyncMap[id.WorkspaceID, *user.Workspace]{},
	}
	r.data.Store(ws.ID(), ws)
	r.data.Store(ws2.ID(), ws2)

	_ = r.Remove(ctx, ws2.ID())
	assert.Equal(t, 1, r.data.Len())
}

func TestWorkspace_RemoveAll(t *testing.T) {
	ctx := context.Background()
	ws := user.NewWorkspace().NewID().Name("hoge").MustBuild()
	ws2 := user.NewWorkspace().NewID().Name("foo").MustBuild()
	r := &Workspace{
		data: &util.SyncMap[id.WorkspaceID, *user.Workspace]{},
	}
	r.data.Store(ws.ID(), ws)
	r.data.Store(ws2.ID(), ws2)

	ids := user.WorkspaceIDList{ws.ID(), ws2.ID()}
	_ = r.RemoveAll(ctx, ids)
	assert.Equal(t, 0, r.data.Len())
}

func TestWorkspace_Save(t *testing.T) {
	ctx := context.Background()
	ws := user.NewWorkspace().NewID().Name("hoge").MustBuild()

	got := &Workspace{
		data: &util.SyncMap[id.WorkspaceID, *user.Workspace]{},
	}
	_ = got.Save(ctx, ws)
	assert.Equal(t, 1, got.data.Len())
}

func TestWorkspace_SaveAll(t *testing.T) {
	ctx := context.Background()
	ws1 := user.NewWorkspace().NewID().Name("hoge").MustBuild()
	ws2 := user.NewWorkspace().NewID().Name("foo").MustBuild()

	got := &Workspace{
		data: &util.SyncMap[id.WorkspaceID, *user.Workspace]{},
	}
	_ = got.SaveAll(ctx, []*user.Workspace{ws1, ws2})
	assert.Equal(t, 2, got.data.Len())
}

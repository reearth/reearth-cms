package publicapi

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

// seedAsset creates and saves an asset along with a matching AssetFile entry
// so that GetAsset (which calls both FindByID and FindFileByID) can succeed.
func seedAsset(t *testing.T, db *repo.Container, pid id.ProjectID) *asset.Asset {
	t.Helper()
	ctx := context.Background()
	uid := accountdomain.NewUserID()
	a := asset.New().
		NewID().
		Project(pid).
		CreatedByUser(uid).
		Size(100).
		NewUUID().
		MustBuild()
	assert.NoError(t, db.Asset.Save(ctx, a))

	af := asset.NewFile().Name("test.txt").Path("test.txt").Size(100).ContentType("text/plain").Build()
	assert.NoError(t, db.AssetFile.Save(ctx, a.ID(), af))
	return a
}

// testEnv is the setup for a Controller-level unit test.
type testEnv struct {
	ctrl      *Controller
	db        *repo.Container
	workspace *workspace.Workspace
	project   *project.Project
}

// newTestEnv creates a Controller backed by in-memory repositories.
// The workspace and project have VisibilityPublic so GetAsset.PublicAssets == true.
func newTestEnv(t *testing.T) *testEnv {
	t.Helper()

	db := memory.New()
	fileGW := lo.Must(fs.NewFile(afero.NewMemMapFs(), "", false))
	gw := &gateway.Container{File: fileGW}

	uc := &interfaces.Container{
		Asset: interactor.NewAsset(db, gw),
	}

	ws := workspace.New().NewID().MustBuild()
	// VisibilityPublic is the default; IsAssetsPublic returns true without an API key.
	p := project.New().
		NewID().
		Workspace(ws.ID()).
		Alias("testproject").
		MustBuild()

	ctx := context.Background()
	assert.NoError(t, db.Workspace.Save(ctx, ws))
	assert.NoError(t, db.Project.Save(ctx, p))

	ctrl := NewController(db.Workspace, db.Project, uc)
	return &testEnv{ctrl: ctrl, db: db, workspace: ws, project: p}
}

func TestGetAsset_returnAssetWhenProjectMatches(t *testing.T) {
	t.Parallel()

	env := newTestEnv(t)
	ctx := context.Background()

	a := seedAsset(t, env.db, env.project.ID())

	// loadWPMContext accepts workspace ID (as ULID string) and project ID.
	wsIDStr := env.workspace.ID().String()
	pIDStr := env.project.ID().String()

	got, err := env.ctrl.GetAsset(ctx, wsIDStr, pIDStr, a.ID().String())
	assert.NoError(t, err)
	assert.Equal(t, a.ID().String(), got.ID)
}

func TestGetAsset_returnNotFoundWhenProjectMismatch(t *testing.T) {
	t.Parallel()

	env := newTestEnv(t)
	ctx := context.Background()

	// ownerProject owns the asset.
	ownerProject := project.New().
		NewID().
		Workspace(env.workspace.ID()).
		Alias("ownerproject").
		MustBuild()
	assert.NoError(t, env.db.Project.Save(ctx, ownerProject))

	a := seedAsset(t, env.db, ownerProject.ID())

	// Request the asset using a different project (env.project doesn't own it).
	wsIDStr := env.workspace.ID().String()
	pIDStr := env.project.ID().String() // env.project != ownerProject

	_, err := env.ctrl.GetAsset(ctx, wsIDStr, pIDStr, a.ID().String())
	assert.ErrorIs(t, err, rerror.ErrNotFound)
}

func TestGetAsset_returnNotFoundForNonexistentAsset(t *testing.T) {
	t.Parallel()

	env := newTestEnv(t)
	ctx := context.Background()

	wsIDStr := env.workspace.ID().String()
	pIDStr := env.project.ID().String()
	nonExistent := id.NewAssetID().String()

	_, err := env.ctrl.GetAsset(ctx, wsIDStr, pIDStr, nonExistent)
	assert.ErrorIs(t, err, rerror.ErrNotFound)
}

package publicapi

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupPostingTest(t *testing.T, postingEnabled bool) (ctrl *Controller, wAlias, pAlias, mKey string, ctx context.Context) {
	t.Helper()
	ctx = context.Background()

	wid := accountdomain.NewWorkspaceID()
	wAlias = wid.String()
	pid := id.NewProjectID()
	pAlias = pid.String()

	ws := workspace.New().
		ID(accountdomain.WorkspaceID(wid)).
		Name("test-ws").
		Members(map[accountdomain.UserID]workspace.Member{}).
		MustBuild()

	a11y := project.NewAccessibility(
		project.VisibilityPublic,
		nil,
		project.NewPostingSettings(postingEnabled),
		nil,
	)
	p := project.New().
		ID(pid).
		Workspace(wid).
		Alias(pAlias).
		Name("test-project").
		Accessibility(a11y).
		MustBuild()

	sid := id.NewSchemaID()
	s := schema.New().
		ID(sid).
		Workspace(accountdomain.WorkspaceID(wid)).
		Project(pid).
		MustBuild()

	mk := id.RandomKey()
	mKey = mk.String()
	m := model.New().
		NewID().
		Schema(sid).
		Key(mk).
		Project(pid).
		MustBuild()

	db := memory.New()
	wsRepo := accountmemory.NewWorkspace()
	require.NoError(t, wsRepo.Save(ctx, ws))
	require.NoError(t, db.Project.Save(ctx, p))
	require.NoError(t, db.Schema.Save(ctx, s))
	require.NoError(t, db.Model.Save(ctx, m))

	ar := &accountrepo.Container{Workspace: wsRepo}
	uc := interactor.New(db, nil, ar, nil, interactor.ContainerConfig{})

	op := &usecase.Operator{AcOperator: &accountusecase.Operator{}}
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUsecases(ctx, &uc)

	ctrl = NewController(wsRepo, db.Project, &uc)
	return ctrl, wAlias, pAlias, mKey, ctx
}

func TestController_PostItem(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		postingEnabled bool
		mutateAliases  func(wAlias, pAlias, mKey string) (string, string, string)
		wantErr        error
	}{
		{
			name:           "posting disabled returns ErrPostingDisabled",
			postingEnabled: false,
			wantErr:        ErrPostingDisabled,
		},
		{
			name:           "posting enabled returns no error",
			postingEnabled: true,
			wantErr:        nil,
		},
		{
			name:           "unknown workspace returns ErrNotFound",
			postingEnabled: true,
			mutateAliases: func(_, pAlias, mKey string) (string, string, string) {
				return "nonexistent-workspace", pAlias, mKey
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:           "unknown project returns ErrNotFound",
			postingEnabled: true,
			mutateAliases: func(wAlias, _, mKey string) (string, string, string) {
				return wAlias, "nonexistent-project", mKey
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:           "unknown model returns ErrNotFound",
			postingEnabled: true,
			mutateAliases: func(wAlias, pAlias, _ string) (string, string, string) {
				return wAlias, pAlias, "nonexistent-model"
			},
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctrl, wAlias, pAlias, mKey, ctx := setupPostingTest(t, tt.postingEnabled)

			if tt.mutateAliases != nil {
				wAlias, pAlias, mKey = tt.mutateAliases(wAlias, pAlias, mKey)
			}

			err := ctrl.PostItem(ctx, wAlias, pAlias, mKey)

			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

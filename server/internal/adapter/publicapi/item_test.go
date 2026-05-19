package publicapi

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
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

func TestController_PostItem_PostingDisabled(t *testing.T) {
	t.Parallel()

	ctrl, wAlias, pAlias, mKey, ctx := setupPostingTest(t, false)

	err := ctrl.PostItem(ctx, wAlias, pAlias, mKey)

	assert.ErrorIs(t, err, ErrPostingDisabled)
}

func TestController_PostItem_PostingEnabled(t *testing.T) {
	t.Parallel()

	ctrl, wAlias, pAlias, mKey, ctx := setupPostingTest(t, true)

	err := ctrl.PostItem(ctx, wAlias, pAlias, mKey)

	assert.False(t, errors.Is(err, ErrPostingDisabled), "posting gate should not fire when enabled")
}

func TestHandler_PostItem_Returns403WhenDisabled(t *testing.T) {
	t.Parallel()

	ctrl, wAlias, pAlias, mKey, baseCtx := setupPostingTest(t, false)

	e := echo.New()
	bodyBytes, _ := json.Marshal(map[string]any{})
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(bodyBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	// Attach controller to the request context so GetController works.
	reqCtx := AttachController(baseCtx, ctrl)
	req = req.WithContext(reqCtx)

	c := e.NewContext(req, rec)
	c.SetPathValues(echo.PathValues{
		{Name: "workspace", Value: wAlias},
		{Name: "project", Value: pAlias},
		{Name: "model", Value: mKey},
	})

	err := PostItem()(c)
	require.NoError(t, err)
	assert.Equal(t, http.StatusForbidden, rec.Code)

	var resp postingDisabledResponse
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
	assert.Equal(t, "posting_disabled", resp.Error)
	assert.Equal(t, "Posting is disabled for this project.", resp.Message)
}

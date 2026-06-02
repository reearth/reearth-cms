package publicapi

import (
	"bytes"
	"context"
	"encoding/json"
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
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupPostingTest(t *testing.T, postingEnabled bool, allowedOrigins []string, modelPostingEnabled ...*bool) (ctrl *Controller, wAlias, pAlias, mKey string, ctx context.Context) {
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

	ps, psErr := project.NewPostingSettings(postingEnabled, allowedOrigins)
	require.NoError(t, psErr)
	a11y := project.NewAccessibility(
		project.VisibilityPublic,
		nil,
		ps,
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

	mEnabled := postingEnabled
	if len(modelPostingEnabled) > 0 && modelPostingEnabled[0] != nil {
		mEnabled = *modelPostingEnabled[0]
	}
	mk := id.RandomKey()
	mKey = mk.String()
	m := model.New().
		NewID().
		Schema(sid).
		Key(mk).
		Project(pid).
		PostingEnabled(mEnabled).
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

	const allowedOrigin = "https://example.com"

	tests := []struct {
		name                string
		postingEnabled      bool
		modelPostingEnabled *bool
		allowedOrigins      []string
		mutateAliases       func(wAlias, pAlias, mKey string) (string, string, string)
		wantErr             error
	}{
		{
			name:           "posting disabled returns ErrProjectPostingDisabled",
			postingEnabled: false,
			allowedOrigins: []string{allowedOrigin},
			wantErr:        ErrProjectPostingDisabled,
		},
		{
			name:           "posting enabled returns no error",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			wantErr:        nil,
		},
		{
			name:                "project enabled but model disabled returns ErrProjectPostingDisabled",
			postingEnabled:      true,
			modelPostingEnabled: lo.ToPtr(false),
			allowedOrigins:      []string{allowedOrigin},
			wantErr:             ErrProjectPostingDisabled,
		},
		{
			name:           "unknown workspace returns ErrNotFound",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			mutateAliases: func(_, pAlias, mKey string) (string, string, string) {
				return "nonexistent-workspace", pAlias, mKey
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:           "unknown project returns ErrNotFound",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			mutateAliases: func(wAlias, _, mKey string) (string, string, string) {
				return wAlias, "nonexistent-project", mKey
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:           "unknown model returns ErrNotFound",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
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
			ctrl, wAlias, pAlias, mKey, ctx := setupPostingTest(t, tt.postingEnabled, tt.allowedOrigins, tt.modelPostingEnabled)
			if tt.mutateAliases != nil {
				wAlias, pAlias, mKey = tt.mutateAliases(wAlias, pAlias, mKey)
			}

			result := ctrl.PostItem(ctx, wAlias, pAlias, mKey, map[string]any{})

			if tt.wantErr != nil {
				assert.ErrorIs(t, result.Err, tt.wantErr)
			} else {
				assert.NoError(t, result.Err)
			}
		})
	}
}

func TestController_ValidatePostingAccess(t *testing.T) {
	t.Parallel()

	const allowedOrigin = "https://example.com"

	tests := []struct {
		name                string
		postingEnabled      bool
		modelPostingEnabled *bool
		allowedOrigins      []string
		origin              string
		wantErr             error
	}{
		{
			name:           "posting disabled returns ErrProjectPostingDisabled",
			postingEnabled: false,
			allowedOrigins: []string{allowedOrigin},
			origin:         allowedOrigin,
			wantErr:        ErrProjectPostingDisabled,
		},
		{
			name:                "project enabled but model disabled returns ErrProjectPostingDisabled",
			postingEnabled:      true,
			modelPostingEnabled: lo.ToPtr(false),
			allowedOrigins:      []string{allowedOrigin},
			origin:              allowedOrigin,
			wantErr:             ErrProjectPostingDisabled,
		},
		{
			name:           "no origins configured returns ErrNoOriginsConfigured",
			postingEnabled: true,
			allowedOrigins: []string{},
			origin:         allowedOrigin,
			wantErr:        project.ErrNoOriginsConfigured,
		},
		{
			name:           "absent origin returns ErrOriginNotAllowed",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			origin:         "",
			wantErr:        project.ErrOriginNotAllowed,
		},
		{
			name:           "origin not in list returns ErrOriginNotAllowed",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			origin:         "https://evil.com",
			wantErr:        project.ErrOriginNotAllowed,
		},
		{
			name:           "matching origin returns no error",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			origin:         allowedOrigin,
			wantErr:        nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl, wAlias, pAlias, mKey, ctx := setupPostingTest(t, tt.postingEnabled, tt.allowedOrigins, tt.modelPostingEnabled)

			err := ctrl.ValidatePostingAccess(ctx, wAlias, pAlias, mKey, tt.origin)

			assert.ErrorIs(t, err, tt.wantErr)
		})
	}
}

func TestHandler_PostItem(t *testing.T) {
	t.Parallel()

	const allowedOrigin = "https://example.com"

	tests := []struct {
		name                string
		postingEnabled      bool
		modelPostingEnabled *bool
		allowedOrigins      []string
		origin              string
		wantStatus          int
		wantErrorCode       string
		wantACOrigin        string
	}{
		{
			name:           "posting disabled returns 403",
			postingEnabled: false,
			allowedOrigins: []string{allowedOrigin},
			origin:         allowedOrigin,
			wantStatus:     http.StatusForbidden,
			wantErrorCode:  "posting_disabled",
		},
		{
			name:                "model posting disabled returns 403",
			postingEnabled:      true,
			modelPostingEnabled: lo.ToPtr(false),
			allowedOrigins:      []string{allowedOrigin},
			origin:              allowedOrigin,
			wantStatus:          http.StatusForbidden,
			wantErrorCode:       "posting_disabled",
		},
		{
			name:           "no origins configured returns 403",
			postingEnabled: true,
			allowedOrigins: []string{},
			origin:         allowedOrigin,
			wantStatus:     http.StatusForbidden,
			wantErrorCode:  "origin_not_allowed",
		},
		{
			name:           "absent origin returns 403",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			origin:         "",
			wantStatus:     http.StatusForbidden,
			wantErrorCode:  "origin_not_allowed",
		},
		{
			name:           "origin not in list returns 403",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			origin:         "https://evil.com",
			wantStatus:     http.StatusForbidden,
			wantErrorCode:  "origin_not_allowed",
		},
		{
			name:           "matching origin returns 202 and CORS header",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			origin:         allowedOrigin,
			wantStatus:     http.StatusAccepted,
			wantACOrigin:   allowedOrigin,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl, wAlias, pAlias, mKey, baseCtx := setupPostingTest(t, tt.postingEnabled, tt.allowedOrigins, tt.modelPostingEnabled)

			e := echo.New()
			bodyBytes, _ := json.Marshal(map[string]any{})
			req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(bodyBytes))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			if tt.origin != "" {
				req.Header.Set("Origin", tt.origin)
			}
			rec := httptest.NewRecorder()

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
			assert.Equal(t, tt.wantStatus, rec.Code)

			if tt.wantErrorCode != "" {
				var resp apiErrorResponse
				require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
				assert.Equal(t, tt.wantErrorCode, resp.Error)
			}
			if tt.wantACOrigin != "" {
				assert.Equal(t, tt.wantACOrigin, rec.Header().Get("Access-Control-Allow-Origin"))
			}
		})
	}
}

func TestHandler_PreflightItem(t *testing.T) {
	t.Parallel()

	const allowedOrigin = "https://example.com"

	tests := []struct {
		name                string
		postingEnabled      bool
		modelPostingEnabled *bool
		allowedOrigins      []string
		origin              string
		wantStatus          int
		wantACOrigin        string
	}{
		{
			name:           "approved preflight returns 204 and CORS headers",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			origin:         allowedOrigin,
			wantStatus:     http.StatusNoContent,
			wantACOrigin:   allowedOrigin,
		},
		{
			name:                "model posting disabled returns 403",
			postingEnabled:      true,
			modelPostingEnabled: lo.ToPtr(false),
			allowedOrigins:      []string{allowedOrigin},
			origin:              allowedOrigin,
			wantStatus:          http.StatusForbidden,
			wantACOrigin:        "",
		},
		{
			name:           "rejected preflight returns 403 and no CORS headers",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			origin:         "https://evil.com",
			wantStatus:     http.StatusForbidden,
			wantACOrigin:   "",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl, wAlias, pAlias, mKey, baseCtx := setupPostingTest(t, tt.postingEnabled, tt.allowedOrigins, tt.modelPostingEnabled)

			e := echo.New()
			req := httptest.NewRequest(http.MethodOptions, "/", nil)
			req.Header.Set("Origin", tt.origin)
			req.Header.Set("Access-Control-Request-Method", "POST")
			rec := httptest.NewRecorder()

			reqCtx := AttachController(baseCtx, ctrl)
			req = req.WithContext(reqCtx)

			c := e.NewContext(req, rec)
			c.SetPathValues(echo.PathValues{
				{Name: "workspace", Value: wAlias},
				{Name: "project", Value: pAlias},
				{Name: "model", Value: mKey},
			})

			err := PreflightItem()(c)
			require.NoError(t, err)
			assert.Equal(t, tt.wantStatus, rec.Code)
			assert.Equal(t, tt.wantACOrigin, rec.Header().Get("Access-Control-Allow-Origin"))

			if tt.wantStatus == http.StatusNoContent {
				assert.Equal(t, "POST", rec.Header().Get("Access-Control-Allow-Methods"))
				assert.Equal(t, "Content-Type", rec.Header().Get("Access-Control-Allow-Headers"))
				assert.Empty(t, rec.Header().Get("Access-Control-Max-Age"))
			}
		})
	}
}

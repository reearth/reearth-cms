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
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
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

func setupPostingTest(t *testing.T, projectPostingEnabled *bool, allowedOrigins []string, modelPostingEnabled *bool, schemaFields ...*schema.Field) (ctrl *Controller, wAlias, pAlias, mKey string, ctx context.Context) {
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

	pEnabled := true
	if projectPostingEnabled != nil {
		pEnabled = *projectPostingEnabled
	}
	ps, psErr := project.NewPostingSettings(pEnabled, allowedOrigins)
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
		Fields(schemaFields).
		MustBuild()

	mEnabled := true
	if modelPostingEnabled != nil {
		mEnabled = *modelPostingEnabled
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

	op := &usecase.Operator{AcOperator: &accountusecase.Operator{}, Anonymous: true}
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUsecases(ctx, &uc)

	ctrl = NewController(wsRepo, db.Project, &uc)
	return ctrl, wAlias, pAlias, mKey, ctx
}

func TestController_PostItem(t *testing.T) {
	t.Parallel()

	const allowedOrigin = "https://example.com"

	requiredTextField := schema.NewField(schema.NewText(nil).TypeProperty()).
		NewID().Key(id.NewKey("title")).Required(true).MustBuild()

	tests := []struct {
		name            string
		schemaFields    []*schema.Field
		body            map[string]any
		mutateAliases   func(wAlias, pAlias, mKey string) (string, string, string)
		wantErr         error
		wantFieldErrors []schema.FieldValidationError
	}{
		{
			name:         "valid body returns no error",
			schemaFields: []*schema.Field{requiredTextField},
			body:         map[string]any{"title": "hello"},
			wantErr:      nil,
		},
		{
			name:         "empty body missing required field returns field errors",
			schemaFields: []*schema.Field{requiredTextField},
			body:         map[string]any{},
			wantFieldErrors: []schema.FieldValidationError{
				{Field: "title", Code: schema.FieldValidationCodeRequired},
			},
		},
		{
			name: "unknown workspace returns ErrNotFound",
			mutateAliases: func(_, pAlias, mKey string) (string, string, string) {
				return "nonexistent-workspace", pAlias, mKey
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "unknown project returns ErrNotFound",
			mutateAliases: func(wAlias, _, mKey string) (string, string, string) {
				return wAlias, "nonexistent-project", mKey
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "unknown model returns ErrNotFound",
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
			ctrl, wAlias, pAlias, mKey, ctx := setupPostingTest(t, nil, []string{allowedOrigin}, nil, tt.schemaFields...)
			if tt.mutateAliases != nil {
				wAlias, pAlias, mKey = tt.mutateAliases(wAlias, pAlias, mKey)
			}

			body := tt.body
			if body == nil {
				body = map[string]any{}
			}
			result := ctrl.PostItem(ctx, wAlias, pAlias, mKey, body)

			if tt.wantErr != nil {
				assert.ErrorIs(t, result.Err, tt.wantErr)
			} else {
				assert.NoError(t, result.Err)
			}
			assert.Equal(t, tt.wantFieldErrors, result.FieldErrors)
		})
	}
}

func TestController_ValidatePostingAccess(t *testing.T) {
	t.Parallel()

	const allowedOrigin = "https://example.com"

	tests := []struct {
		name                  string
		projectPostingEnabled *bool
		modelPostingEnabled   *bool
		allowedOrigins        []string
		origin                string
		mutateAliases         func(wAlias, pAlias, mKey string) (string, string, string)
		wantErr               error
	}{
		{
			name:           "unknown workspace returns ErrNotFound",
			allowedOrigins: []string{allowedOrigin},
			origin:         allowedOrigin,
			mutateAliases: func(_, pAlias, mKey string) (string, string, string) {
				return "nonexistent-workspace", pAlias, mKey
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:                  "project posting disabled returns ErrProjectPostingDisabled",
			projectPostingEnabled: lo.ToPtr(false),
			allowedOrigins:        []string{allowedOrigin},
			origin:                allowedOrigin,
			wantErr:               ErrProjectPostingDisabled,
		},
		{
			name:                "model posting disabled returns ErrModelPostingDisabled",
			modelPostingEnabled: lo.ToPtr(false),
			allowedOrigins:      []string{allowedOrigin},
			origin:              allowedOrigin,
			wantErr:             ErrModelPostingDisabled,
		},
		{
			name:           "no origins configured returns ErrNoOriginsConfigured",
			allowedOrigins: []string{},
			origin:         allowedOrigin,
			wantErr:        project.ErrNoOriginsConfigured,
		},
		{
			name:           "absent origin skips origin check",
			allowedOrigins: []string{allowedOrigin},
			origin:         "",
			wantErr:        nil,
		},
		{
			name:           "absent origin with no origins configured skips origin check",
			allowedOrigins: []string{},
			origin:         "",
			wantErr:        nil,
		},
		{
			name:           "origin not in list returns ErrOriginNotAllowed",
			allowedOrigins: []string{allowedOrigin},
			origin:         "https://evil.com",
			wantErr:        project.ErrOriginNotAllowed,
		},
		{
			name:           "matching origin returns no error",
			allowedOrigins: []string{allowedOrigin},
			origin:         allowedOrigin,
			wantErr:        nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl, wAlias, pAlias, mKey, ctx := setupPostingTest(t, tt.projectPostingEnabled, tt.allowedOrigins, tt.modelPostingEnabled)
			if tt.mutateAliases != nil {
				wAlias, pAlias, mKey = tt.mutateAliases(wAlias, pAlias, mKey)
			}

			err := ctrl.ValidatePostingAccess(ctx, wAlias, pAlias, mKey, tt.origin)

			assert.ErrorIs(t, err, tt.wantErr)
		})
	}
}

func TestHandler_PostItem(t *testing.T) {
	t.Parallel()

	const allowedOrigin = "https://example.com"

	tests := []struct {
		name                  string
		projectPostingEnabled *bool
		modelPostingEnabled   *bool
		allowedOrigins        []string
		origin                string
		wantStatus            int
		wantErrorCode         string
		wantMessage           string
		wantACOrigin          string
	}{
		{
			name:                  "project posting disabled returns 403",
			projectPostingEnabled: lo.ToPtr(false),
			allowedOrigins:        []string{allowedOrigin},
			origin:                allowedOrigin,
			wantStatus:            http.StatusForbidden,
			wantErrorCode:         "posting_disabled",
			wantMessage:           msgPostingDisabled,
		},
		{
			name:                "model posting disabled returns 403",
			modelPostingEnabled: lo.ToPtr(false),
			allowedOrigins:      []string{allowedOrigin},
			origin:              allowedOrigin,
			wantStatus:          http.StatusForbidden,
			wantErrorCode:       "model_posting_disabled",
			wantMessage:         msgModelPostingDisabled,
		},
		{
			name:           "no origins configured returns 403",
			allowedOrigins: []string{},
			origin:         allowedOrigin,
			wantStatus:     http.StatusForbidden,
			wantErrorCode:  "origin_not_allowed",
			wantMessage:    msgNoOriginsConfigured,
		},
		{
			name:           "absent origin passes through without CORS header",
			allowedOrigins: []string{allowedOrigin},
			origin:         "",
			wantStatus:     http.StatusAccepted,
		},
		{
			name:           "absent origin with no origins configured passes through",
			allowedOrigins: []string{},
			origin:         "",
			wantStatus:     http.StatusAccepted,
		},
		{
			name:           "origin not in list returns 403",
			allowedOrigins: []string{allowedOrigin},
			origin:         "https://evil.com",
			wantStatus:     http.StatusForbidden,
			wantErrorCode:  "origin_not_allowed",
			wantMessage:    msgOriginNotAllowed,
		},
		{
			name:           "matching origin returns 202 and CORS header",
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
			ctrl, wAlias, pAlias, mKey, baseCtx := setupPostingTest(t, tt.projectPostingEnabled, tt.allowedOrigins, tt.modelPostingEnabled)

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
				assert.Equal(t, tt.wantMessage, resp.Message)
			}
			assert.Equal(t, tt.wantACOrigin, rec.Header().Get("Access-Control-Allow-Origin"))
		})
	}
}

func TestHandler_PreflightItem(t *testing.T) {
	t.Parallel()

	const allowedOrigin = "https://example.com"

	tests := []struct {
		name                  string
		projectPostingEnabled *bool
		modelPostingEnabled   *bool
		allowedOrigins        []string
		origin                string
		wantStatus            int
		wantACOrigin          string
		wantErrorCode         string
	}{
		{
			name:           "approved preflight returns 204 and CORS headers",
			allowedOrigins: []string{allowedOrigin},
			origin:         allowedOrigin,
			wantStatus:     http.StatusNoContent,
			wantACOrigin:   allowedOrigin,
		},
		{
			name:                  "project posting disabled returns 403",
			projectPostingEnabled: lo.ToPtr(false),
			allowedOrigins:        []string{allowedOrigin},
			origin:                allowedOrigin,
			wantStatus:            http.StatusForbidden,
			wantACOrigin:          "",
			wantErrorCode:         "posting_disabled",
		},
		{
			name:                "model posting disabled returns 403",
			modelPostingEnabled: lo.ToPtr(false),
			allowedOrigins:      []string{allowedOrigin},
			origin:              allowedOrigin,
			wantStatus:          http.StatusForbidden,
			wantACOrigin:        "",
			wantErrorCode:       "model_posting_disabled",
		},
		{
			name:           "rejected preflight returns 403 and no CORS headers",
			allowedOrigins: []string{allowedOrigin},
			origin:         "https://evil.com",
			wantStatus:     http.StatusForbidden,
			wantACOrigin:   "",
			wantErrorCode:  "origin_not_allowed",
		},
		{
			name:           "no origins configured rejects preflight",
			allowedOrigins: []string{},
			origin:         allowedOrigin,
			wantStatus:     http.StatusForbidden,
			wantACOrigin:   "",
			wantErrorCode:  "origin_not_allowed",
		},
		{
			name:           "absent origin passes through without CORS headers",
			allowedOrigins: []string{allowedOrigin},
			origin:         "",
			wantStatus:     http.StatusNoContent,
			wantACOrigin:   "",
		},
		{
			name:           "absent origin with no origins configured passes through",
			allowedOrigins: []string{},
			origin:         "",
			wantStatus:     http.StatusNoContent,
			wantACOrigin:   "",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl, wAlias, pAlias, mKey, baseCtx := setupPostingTest(t, tt.projectPostingEnabled, tt.allowedOrigins, tt.modelPostingEnabled)

			e := echo.New()
			req := httptest.NewRequest(http.MethodOptions, "/", nil)
			if tt.origin != "" {
				req.Header.Set("Origin", tt.origin)
			}
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

			if tt.wantErrorCode != "" {
				var resp apiErrorResponse
				require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
				assert.Equal(t, tt.wantErrorCode, resp.Error)
			}

			if tt.wantACOrigin != "" {
				assert.Equal(t, "POST", rec.Header().Get("Access-Control-Allow-Methods"))
				assert.Equal(t, "Content-Type", rec.Header().Get("Access-Control-Allow-Headers"))
				assert.Empty(t, rec.Header().Get("Access-Control-Max-Age"))
			} else {
				assert.Empty(t, rec.Header().Get("Access-Control-Allow-Methods"))
				assert.Empty(t, rec.Header().Get("Access-Control-Allow-Headers"))
			}
		})
	}
}

func TestFieldsFromBody(t *testing.T) {
	t.Parallel()

	textField := schema.NewField(schema.NewText(nil).TypeProperty()).
		NewID().Key(id.NewKey("title")).MustBuild()
	numberTP, err := schema.NewNumber(nil, nil)
	require.NoError(t, err)
	numberField := schema.NewField(numberTP.TypeProperty()).
		NewID().Key(id.NewKey("count")).MustBuild()

	s := schema.New().NewID().
		Workspace(accountdomain.NewWorkspaceID()).
		Project(id.NewProjectID()).
		Fields([]*schema.Field{textField, numberField}).
		MustBuild()

	titleParam := interfaces.ItemFieldParam{Field: textField.ID().Ref(), Key: textField.Key().Ref(), Value: "hello"}
	countParam := interfaces.ItemFieldParam{Field: numberField.ID().Ref(), Key: numberField.Key().Ref(), Value: 42}

	tests := []struct {
		name string
		body map[string]any
		want []interfaces.ItemFieldParam
	}{
		{
			name: "maps known fields by key",
			body: map[string]any{"title": "hello", "count": 42},
			want: []interfaces.ItemFieldParam{titleParam, countParam},
		},
		{
			name: "ignores keys not in schema",
			body: map[string]any{"title": "hello", "unknown": "x"},
			want: []interfaces.ItemFieldParam{titleParam},
		},
		{
			name: "empty body returns empty slice",
			body: map[string]any{},
			want: []interfaces.ItemFieldParam{},
		},
		{
			name: "missing field is not included",
			body: map[string]any{"count": 1},
			want: []interfaces.ItemFieldParam{{Field: numberField.ID().Ref(), Key: numberField.Key().Ref(), Value: 1}},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.ElementsMatch(t, tt.want, fieldsFromBody(tt.body, s))
		})
	}
}

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
	"github.com/reearth/reearth-cms/server/pkg/item"
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

func setupPostingTest(t *testing.T, postingEnabled bool, allowedOrigins []string, modelPostingEnabled *bool, schemaFields ...*schema.Field) (ctrl *Controller, wAlias, pAlias, mKey string, ctx context.Context, uc *interfaces.Container) {
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
		Fields(schemaFields).
		MustBuild()

	mEnabled := postingEnabled
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
	ucVal := interactor.New(db, nil, ar, nil, interactor.ContainerConfig{})
	uc = &ucVal

	op := &usecase.Operator{AcOperator: &accountusecase.Operator{}}
	ctx = adapter.AttachOperator(ctx, op)
	ctx = adapter.AttachUsecases(ctx, uc)

	ctrl = NewController(wsRepo, db.Project, uc)
	return ctrl, wAlias, pAlias, mKey, ctx, uc
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
		wantItem        bool
	}{
		{
			name:         "valid body creates draft item and returns response",
			schemaFields: []*schema.Field{requiredTextField},
			body:         map[string]any{"title": "hello"},
			wantItem:     true,
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
			ctrl, wAlias, pAlias, mKey, ctx, uc := setupPostingTest(t, true, []string{allowedOrigin}, nil, tt.schemaFields...)
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
				assert.Nil(t, result.Item)
			} else {
				assert.NoError(t, result.Err)
			}
			assert.Equal(t, tt.wantFieldErrors, result.FieldErrors)

			if tt.wantItem {
				require.NotNil(t, result.Item)
				assert.NotEmpty(t, result.Item.ID)
				assert.False(t, result.Item.CreatedAt.IsZero())
				assert.NotNil(t, result.Item.Fields)

				iid, err := id.ItemIDFrom(result.Item.ID)
				require.NoError(t, err)
				statuses, err := uc.Item.ItemStatus(ctx, id.ItemIDList{iid}, nil)
				require.NoError(t, err)
				assert.Equal(t, item.StatusDraft, statuses[iid])
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
		mutateAliases       func(wAlias, pAlias, mKey string) (string, string, string)
		wantErr             error
	}{
		{
			name:           "unknown workspace returns ErrNotFound",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			origin:         allowedOrigin,
			mutateAliases: func(_, pAlias, mKey string) (string, string, string) {
				return "nonexistent-workspace", pAlias, mKey
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name:           "posting disabled returns ErrProjectPostingDisabled",
			postingEnabled: false,
			allowedOrigins: []string{allowedOrigin},
			origin:         allowedOrigin,
			wantErr:        ErrProjectPostingDisabled,
		},
		{
			name:                "project enabled but model disabled returns ErrModelPostingDisabled",
			postingEnabled:      true,
			modelPostingEnabled: lo.ToPtr(false),
			allowedOrigins:      []string{allowedOrigin},
			origin:              allowedOrigin,
			wantErr:             ErrModelPostingDisabled,
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
			ctrl, wAlias, pAlias, mKey, ctx, _ := setupPostingTest(t, tt.postingEnabled, tt.allowedOrigins, tt.modelPostingEnabled)
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
		name                string
		postingEnabled      bool
		modelPostingEnabled *bool
		allowedOrigins      []string
		origin              string
		body                map[string]any
		schemaFields        []*schema.Field
		wantStatus          int
		wantErrorCode       string
		wantACOrigin        string
		wantItemInBody      bool
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
			wantErrorCode:       "model_posting_disabled",
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
			name:           "matching origin returns 202 with item id and createdAt",
			postingEnabled: true,
			allowedOrigins: []string{allowedOrigin},
			origin:         allowedOrigin,
			schemaFields: []*schema.Field{
				schema.NewField(schema.NewText(nil).TypeProperty()).
					NewID().Key(id.NewKey("title")).MustBuild(),
			},
			body:           map[string]any{"title": "hello"},
			wantStatus:     http.StatusAccepted,
			wantACOrigin:   allowedOrigin,
			wantItemInBody: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl, wAlias, pAlias, mKey, baseCtx, _ := setupPostingTest(t, tt.postingEnabled, tt.allowedOrigins, tt.modelPostingEnabled, tt.schemaFields...)

			e := echo.New()
			reqBody := tt.body
			if reqBody == nil {
				reqBody = map[string]any{}
			}
			bodyBytes, _ := json.Marshal(map[string]any{"fields": reqBody})
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
			if tt.wantItemInBody {
				var resp map[string]any
				require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
				assert.NotEmpty(t, resp["id"])
				assert.NotEmpty(t, resp["$createdAt"])
				assert.NotNil(t, resp["fields"])
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
		wantErrorCode       string
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
			wantErrorCode:       "model_posting_disabled",
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
			ctrl, wAlias, pAlias, mKey, baseCtx, _ := setupPostingTest(t, tt.postingEnabled, tt.allowedOrigins, tt.modelPostingEnabled)

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

			if tt.wantErrorCode != "" {
				var resp apiErrorResponse
				require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
				assert.Equal(t, tt.wantErrorCode, resp.Error)
			}

			if tt.wantStatus == http.StatusNoContent {
				assert.Equal(t, "POST", rec.Header().Get("Access-Control-Allow-Methods"))
				assert.Equal(t, "Content-Type", rec.Header().Get("Access-Control-Allow-Headers"))
				assert.Empty(t, rec.Header().Get("Access-Control-Max-Age"))
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

	tests := []struct {
		name       string
		body       map[string]any
		wantKeys   []string
		wantAbsent []string
	}{
		{
			name:     "maps known fields by key",
			body:     map[string]any{"title": "hello", "count": 42},
			wantKeys: []string{"title", "count"},
		},
		{
			name:       "ignores keys not in schema",
			body:       map[string]any{"title": "hello", "unknown": "x"},
			wantKeys:   []string{"title"},
			wantAbsent: []string{"unknown"},
		},
		{
			name:     "empty body returns empty slice",
			body:     map[string]any{},
			wantKeys: []string{},
		},
		{
			name:       "missing field is not included",
			body:       map[string]any{"count": 1},
			wantKeys:   []string{"count"},
			wantAbsent: []string{"title"},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			params := fieldsFromBody(tt.body, s)

			gotKeys := make([]string, 0, len(params))
			for _, p := range params {
				require.NotNil(t, p.Key)
				gotKeys = append(gotKeys, p.Key.String())
				assert.NotNil(t, p.Field)
				assert.Equal(t, tt.body[p.Key.String()], p.Value)
			}

			for _, wk := range tt.wantKeys {
				assert.Contains(t, gotKeys, wk)
			}
			for _, ak := range tt.wantAbsent {
				assert.NotContains(t, gotKeys, ak)
			}
		})
	}
}

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
	"github.com/samber/lo"
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

func setupPostingTestWithFields(t *testing.T, fields schema.FieldList) (ctrl *Controller, wAlias, pAlias, mKey string, ctx context.Context) {
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
		project.NewPostingSettings(true),
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
		Fields(fields).
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

func newTestField(key string, tp *schema.TypeProperty, required bool) *schema.Field {
	k := id.NewKey(key)
	return schema.NewField(tp).NewID().Key(k).Name(key).Required(required).MustBuild()
}

func newTestFieldMultiple(key string, tp *schema.TypeProperty, required bool) *schema.Field {
	k := id.NewKey(key)
	return schema.NewField(tp).NewID().Key(k).Name(key).Required(required).Multiple(true).MustBuild()
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
			wantErr:        ErrProjectPostingDisabled,
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

			result := ctrl.PostItem(ctx, wAlias, pAlias, mKey, map[string]any{})

			if tt.wantErr != nil {
				assert.ErrorIs(t, result.Err, tt.wantErr)
			} else {
				assert.NoError(t, result.Err)
			}
		})
	}
}

func TestController_PostItem_Validation(t *testing.T) {
	t.Parallel()

	intField, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	numField, _ := schema.NewNumber(lo.ToPtr(0.0), lo.ToPtr(1.0))

	tests := []struct {
		name           string
		fields         schema.FieldList
		body           map[string]any
		wantFieldCodes map[string]schema.FieldValidationCode
	}{
		// --- gate / edge cases ---
		{
			name: "valid payload returns no field errors",
			fields: schema.FieldList{
				newTestField("title", schema.NewText(nil).TypeProperty(), true),
			},
			body:           map[string]any{"title": "hello"},
			wantFieldCodes: nil,
		},
		{
			name: "unknown keys are silently ignored",
			fields: schema.FieldList{
				newTestField("title", schema.NewText(nil).TypeProperty(), false),
			},
			body:           map[string]any{"title": "hi", "unknown": "ignored"},
			wantFieldCodes: nil,
		},
		{
			name: "missing required field is reported",
			fields: schema.FieldList{
				newTestField("title", schema.NewText(nil).TypeProperty(), true),
			},
			body: map[string]any{},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"title": schema.FieldValidationCodeRequired,
			},
		},
		{
			name: "multiple field errors reported together",
			fields: schema.FieldList{
				newTestField("title", schema.NewText(nil).TypeProperty(), true),
				newTestField("count", intField.TypeProperty(), false),
			},
			body: map[string]any{"count": float64(999)},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"title": schema.FieldValidationCodeRequired,
				"count": schema.FieldValidationCodeConstraint,
			},
		},
		// --- Text (maxLength) ---
		{
			name: "text exceeds maxLength",
			fields: schema.FieldList{
				newTestField("bio", schema.NewText(lo.ToPtr(5)).TypeProperty(), false),
			},
			body: map[string]any{"bio": "too long string"},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"bio": schema.FieldValidationCodeConstraint,
			},
		},
		// --- TextArea (maxLength) ---
		{
			name: "textarea exceeds maxLength",
			fields: schema.FieldList{
				newTestField("body", schema.NewTextArea(lo.ToPtr(5)).TypeProperty(), false),
			},
			body: map[string]any{"body": "too long string"},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"body": schema.FieldValidationCodeConstraint,
			},
		},
		// --- RichText (maxLength) ---
		{
			name: "richtext exceeds maxLength",
			fields: schema.FieldList{
				newTestField("content", schema.NewRichText(lo.ToPtr(5)).TypeProperty(), false),
			},
			body: map[string]any{"content": "too long string"},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"content": schema.FieldValidationCodeConstraint,
			},
		},
		// --- MarkdownText (maxLength) ---
		{
			name: "markdown exceeds maxLength",
			fields: schema.FieldList{
				newTestField("md", schema.NewMarkdown(lo.ToPtr(5)).TypeProperty(), false),
			},
			body: map[string]any{"md": "too long string"},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"md": schema.FieldValidationCodeConstraint,
			},
		},
		// --- Integer (min/max) ---
		{
			name: "integer out of range",
			fields: schema.FieldList{
				newTestField("count", intField.TypeProperty(), false),
			},
			body: map[string]any{"count": float64(200)},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"count": schema.FieldValidationCodeConstraint,
			},
		},
		{
			name: "integer type mismatch",
			fields: schema.FieldList{
				newTestField("count", intField.TypeProperty(), false),
			},
			body: map[string]any{"count": map[string]any{"bad": "value"}},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"count": schema.FieldValidationCodeTypeMismatch,
			},
		},
		// --- Number (min/max) ---
		{
			name: "number out of range",
			fields: schema.FieldList{
				newTestField("score", numField.TypeProperty(), false),
			},
			body: map[string]any{"score": float64(1.5)},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"score": schema.FieldValidationCodeConstraint,
			},
		},
		{
			name: "number type mismatch",
			fields: schema.FieldList{
				newTestField("score", numField.TypeProperty(), false),
			},
			body: map[string]any{"score": map[string]any{"bad": "value"}},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"score": schema.FieldValidationCodeTypeMismatch,
			},
		},
		// --- Select (allowed values) ---
		{
			name: "select invalid value",
			fields: schema.FieldList{
				newTestField("status", schema.NewSelect([]string{"open", "closed"}).TypeProperty(), false),
			},
			body: map[string]any{"status": "pending"},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"status": schema.FieldValidationCodeConstraint,
			},
		},
		// --- Bool ---
		{
			name: "bool type mismatch",
			fields: schema.FieldList{
				newTestField("active", schema.NewBool().TypeProperty(), false),
			},
			body: map[string]any{"active": map[string]any{"bad": "value"}},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"active": schema.FieldValidationCodeTypeMismatch,
			},
		},
		// --- Checkbox ---
		{
			name: "checkbox type mismatch",
			fields: schema.FieldList{
				newTestField("agreed", schema.NewCheckbox().TypeProperty(), false),
			},
			body: map[string]any{"agreed": map[string]any{"bad": "value"}},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"agreed": schema.FieldValidationCodeTypeMismatch,
			},
		},
		// --- DateTime ---
		{
			name: "datetime type mismatch",
			fields: schema.FieldList{
				newTestField("publishedAt", schema.NewDateTime().TypeProperty(), false),
			},
			body: map[string]any{"publishedAt": map[string]any{"bad": "value"}},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"publishedAt": schema.FieldValidationCodeTypeMismatch,
			},
		},
		// --- URL ---
		{
			name: "url type mismatch",
			fields: schema.FieldList{
				newTestField("website", schema.NewURL().TypeProperty(), false),
			},
			body: map[string]any{"website": map[string]any{"bad": "value"}},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"website": schema.FieldValidationCodeTypeMismatch,
			},
		},
		// --- single vs multiple ---
		{
			name: "single field accepts scalar value",
			fields: schema.FieldList{
				newTestField("tag", schema.NewText(nil).TypeProperty(), false),
			},
			body:           map[string]any{"tag": "one"},
			wantFieldCodes: nil,
		},
		{
			name: "single field rejects array with multiple values",
			fields: schema.FieldList{
				newTestField("tag", schema.NewText(nil).TypeProperty(), false),
			},
			body: map[string]any{"tag": []any{"one", "two"}},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"tag": schema.FieldValidationCodeConstraint,
			},
		},
		{
			name: "multiple field accepts array of values",
			fields: schema.FieldList{
				newTestFieldMultiple("tags", schema.NewText(nil).TypeProperty(), false),
			},
			body:           map[string]any{"tags": []any{"one", "two", "three"}},
			wantFieldCodes: nil,
		},
		{
			name: "multiple field accepts scalar as single-item",
			fields: schema.FieldList{
				newTestFieldMultiple("tags", schema.NewText(nil).TypeProperty(), false),
			},
			body:           map[string]any{"tags": "one"},
			wantFieldCodes: nil,
		},
		{
			name: "multiple field reports type mismatch on invalid item in array",
			fields: schema.FieldList{
				newTestFieldMultiple("counts", schema.MustNewInteger(nil, nil).TypeProperty(), false),
			},
			body: map[string]any{"counts": []any{float64(1), map[string]any{"bad": "value"}}},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"counts": schema.FieldValidationCodeTypeMismatch,
			},
		},
		{
			name: "multiple field reports constraint violation on item out of range",
			fields: schema.FieldList{
				newTestFieldMultiple("ages", schema.MustNewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(10))).TypeProperty(), false),
			},
			body: map[string]any{"ages": []any{float64(5), float64(999)}},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"ages": schema.FieldValidationCodeConstraint,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctrl, wAlias, pAlias, mKey, ctx := setupPostingTestWithFields(t, tt.fields)

			result := ctrl.PostItem(ctx, wAlias, pAlias, mKey, tt.body)

			require.NoError(t, result.Err)

			if tt.wantFieldCodes == nil {
				assert.Empty(t, result.FieldErrors)
			} else {
				assert.Len(t, result.FieldErrors, len(tt.wantFieldCodes))
				for _, fe := range result.FieldErrors {
					wantCode, exists := tt.wantFieldCodes[fe.Field]
					assert.True(t, exists, "unexpected field error for %q", fe.Field)
					assert.Equal(t, wantCode, fe.Code)
				}
			}
		})
	}
}

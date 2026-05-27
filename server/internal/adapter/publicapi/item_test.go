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

			_, err := ctrl.PostItem(ctx, wAlias, pAlias, mKey, map[string]any{})

			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestController_PostItem_Validation(t *testing.T) {
	t.Parallel()

	intField, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))

	tests := []struct {
		name           string
		fields         schema.FieldList
		body           map[string]any
		wantFieldCodes map[string]schema.FieldValidationCode
	}{
		{
			name: "valid payload returns no field errors",
			fields: schema.FieldList{
				newTestField("title", schema.NewText(nil).TypeProperty(), true),
			},
			body:           map[string]any{"title": "hello"},
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
			name: "integer out of range is reported",
			fields: schema.FieldList{
				newTestField("count", intField.TypeProperty(), false),
			},
			body: map[string]any{"count": float64(200)},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"count": schema.FieldValidationCodeConstraint,
			},
		},
		{
			name: "type mismatch is reported",
			fields: schema.FieldList{
				newTestField("count", intField.TypeProperty(), false),
			},
			body: map[string]any{"count": map[string]any{"bad": "value"}},
			wantFieldCodes: map[string]schema.FieldValidationCode{
				"count": schema.FieldValidationCodeTypeMismatch,
			},
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
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctrl, wAlias, pAlias, mKey, ctx := setupPostingTestWithFields(t, tt.fields)

			fieldErrs, err := ctrl.PostItem(ctx, wAlias, pAlias, mKey, tt.body)

			require.NoError(t, err)

			if tt.wantFieldCodes == nil {
				assert.Empty(t, fieldErrs)
			} else {
				assert.Len(t, fieldErrs, len(tt.wantFieldCodes))
				for _, fe := range fieldErrs {
					wantCode, exists := tt.wantFieldCodes[fe.Field]
					assert.True(t, exists, "unexpected field error for %q", fe.Field)
					assert.Equal(t, wantCode, fe.Code)
				}
			}
		})
	}
}

package publicapi

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var ErrInvalidProject = rerror.NewE(i18n.T("invalid project"))

type Controller struct {
	project   repo.Project
	workspace accountrepo.Workspace
	usecases  *interfaces.Container
}

type WPMContext struct {
	Workspace     workspace.Workspace
	Project       project.Project
	Model         *model.Model
	SchemaPackage *schema.Package
	PublicAssets  bool
	PublicModels  id.ModelIDList
}

func NewController(workspace accountrepo.Workspace, project repo.Project, usecases *interfaces.Container) *Controller {
	return &Controller{
		workspace: workspace,
		project:   project,
		usecases:  usecases,
	}
}

func (c *Controller) loadWPMContext(ctx context.Context, wAlias, pAlias, mKey string) (*WPMContext, error) {
	w, err := c.workspace.FindByIDOrAlias(ctx, accountdomain.WorkspaceIDOrAlias(wAlias))
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, rerror.ErrNotFound
		}
		return nil, ErrInvalidProject
	}

	p, err := c.project.FindByIDOrAlias(ctx, w.ID(), project.IDOrAlias(pAlias))
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, rerror.ErrNotFound
		}
		return nil, ErrInvalidProject
	}

	// Check if the project belongs to the workspace
	if p.Workspace() != w.ID() {
		return nil, rerror.ErrNotFound
	}

	var m *model.Model
	var sp *schema.Package
	if mKey != "" {
		m, err = c.usecases.Model.FindByIDOrKey(ctx, p.ID(), model.IDOrKey(mKey), nil)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return nil, rerror.ErrNotFound
			}
			return nil, ErrInvalidProject
		}

		sp, err = c.usecases.Schema.FindByModel(ctx, m.ID(), nil)
		if err != nil {
			return nil, ErrInvalidProject
		}

		// Check if the model belongs to the project
		if m.Project() != p.ID() {
			return nil, rerror.ErrNotFound
		}
	}

	wpm := &WPMContext{
		Workspace:     *w,
		Project:       *p,
		Model:         m,
		SchemaPackage: sp,
	}

	if err := c.accessibilityCheck(ctx, wpm); err != nil {
		return nil, err
	}

	return wpm, nil
}

func (c *Controller) accessibilityCheck(ctx context.Context, wpm *WPMContext) error {
	a11y := wpm.Project.Accessibility()
	keyId := adapter.APIKeyId(ctx)

	wpm.PublicAssets = a11y.IsAssetsPublic(keyId)

	if wpm.Model == nil {
		return nil
	}

	if !a11y.IsModelPublic(wpm.Model.ID(), keyId) {
		return rerror.ErrNotFound
	}

	wpm.PublicModels = lo.FilterMap(wpm.SchemaPackage.Schema().FieldsByType(value.TypeReference), func(f *schema.Field, _ int) (id.ModelID, bool) {
		if f == nil {
			return id.ModelID{}, false
		}
		var mId id.ModelID
		f.TypeProperty().Match(schema.TypePropertyMatch{
			Reference: func(f *schema.FieldReference) {
				if a11y.IsModelPublic(f.Model(), keyId) {
					mId = f.Model()
				}
			},
			Default: nil,
		})

		return mId, true
	})

	return nil
}

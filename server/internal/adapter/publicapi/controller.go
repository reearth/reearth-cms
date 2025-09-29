package publicapi

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var ErrInvalidProject = rerror.NewE(i18n.T("invalid project"))

type Controller struct {
	usecases *interfaces.Container
}

func NewController(project repo.Project, usecases *interfaces.Container) *Controller {
	return &Controller{
		usecases: usecases,
	}
}

func (c *Controller) accessibilityCheck(ctx context.Context, wAlias, pAlias, mKey string) (p *project.Project, m *model.Model, a bool, err error) {
	keyId := adapter.APIKeyId(ctx)
	p, err = c.usecases.Project.FindByAliases(ctx, wAlias, pAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return nil, nil, false, rerror.ErrNotFound
		}
		return nil, nil, false, ErrInvalidProject
	}
	a11y := p.Accessibility()

	if mKey != "" {
		m, err = c.usecases.Model.FindByIDOrKey(ctx, p.ID(), model.IDOrKey(mKey), nil)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return nil, nil, false, rerror.ErrNotFound
			}
			return nil, nil, false, ErrInvalidProject
		}
		if a11y != nil &&
			a11y.Visibility() == project.VisibilityPrivate &&
			!a11y.Publication().PublicModels().Has(m.ID()) &&
			(keyId == nil || !a11y.APIKeyById(*keyId).Publication().PublicModels().Has(m.ID())) {
			return nil, nil, false, rerror.ErrNotFound
		}
	}

	if a11y == nil ||
		a11y.Visibility() == project.VisibilityPublic ||
		a11y.Publication().PublicAssets() ||
		(keyId != nil && a11y.APIKeyById(*keyId).Publication().PublicAssets()) {
		a = true
	}
	return p, m, a, nil
}

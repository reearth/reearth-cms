package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/rerror"
)

//go:generate npx @redocly/cli bundle ../../../schemas/integration/integration.yml -o ../../../schemas/integration/integration.bundled.yml --ext yml
//go:generate go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen --config=server.cfg.yml ../../../schemas/integration/integration.bundled.yml

type Server struct{}

func NewServer() *Server {
	return &Server{}
}

var _ StrictServerInterface = (*Server)(nil)

type WPContext struct {
	Workspace workspace.Workspace
	Project   project.Project
	Model     *model.Model
}

func (s *Server) loadWPContext(ctx context.Context, wAlias accountdomain.WorkspaceIDOrAlias, pAlias project.IDOrAlias, mKey *model.IDOrKey) (*WPContext, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)
	ar := adapter.AcRepos(ctx)

	if uc == nil || ar == nil {
		return nil, rerror.ErrInternalBy(errors.New("usecase or repository not found in context"))
	}

	w, err := ar.Workspace.FindByIDOrAlias(ctx, wAlias)
	if err != nil {
		return nil, err
	}

	p, err := uc.Project.FindByIDOrAlias(ctx, wAlias, pAlias, op)
	if err != nil {
		return nil, err
	}

	if p.Workspace() != w.ID() {
		return nil, rerror.ErrNotFound
	}

	var m *model.Model
	if mKey != nil {
		m, err = uc.Model.FindByIDOrKey(ctx, p.ID(), *mKey, op)
		if err != nil {
			return nil, err
		}

		if m.Project() != p.ID() {
			return nil, rerror.ErrNotFound
		}
	}

	return &WPContext{
		Workspace: *w,
		Project:   *p,
		Model:     m,
	}, nil
}

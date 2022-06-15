package interactor

import (
	"net/url"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ContainerConfig struct {
	SignupSecret    string
	AuthSrvUIDomain string
}

func New(r *repo.Container, g *gateway.Container, config ContainerConfig) interfaces.Container {

	return interfaces.Container{
		Workspace: NewWorkspace(r),
		User:      NewUser(r, g, config.SignupSecret, config.AuthSrvUIDomain),
	}
}

// Deprecated: common will be deprecated . Please use the Usecase function instead.
type common struct{}

func (common) OnlyOperator(op *usecase.Operator) error {
	if op == nil {
		return interfaces.ErrOperationDenied
	}
	return nil
}

func (i common) CanReadWorkspace(t id.WorkspaceID, op *usecase.Operator) error {
	if err := i.OnlyOperator(op); err != nil {
		return err
	}
	if !op.IsReadableWorkspace(t) {
		return interfaces.ErrOperationDenied
	}
	return nil
}

func (i common) CanWriteWorkspace(t id.WorkspaceID, op *usecase.Operator) error {
	if err := i.OnlyOperator(op); err != nil {
		return err
	}
	if !op.IsWritableWorkspace(t) {
		return interfaces.ErrOperationDenied
	}
	return nil
}

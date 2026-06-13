package account

import (
	"context"
	"net/http"

	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	gqlclientuser "github.com/reearth/reearth-accounts/server/pkg/gqlclient/user"
	"github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
)

type accountGateway struct {
	client *gqlclient.Client
}

func New(host string, timeout int, transport http.RoundTripper) gateway.Account {
	return &accountGateway{
		client: gqlclient.NewClient(host, timeout, transport),
	}
}

func (a *accountGateway) FindMe(ctx context.Context) (*user.User, error) {
	return a.client.UserRepo.FindMe(ctx)
}

func (a *accountGateway) FindByID(ctx context.Context, id string) (*user.User, error) {
	return a.client.UserRepo.FindByID(ctx, id)
}

func (a *accountGateway) UpdateMe(ctx context.Context, input gateway.UpdateMeInput) (*user.User, error) {
	updateInput := gqlclientuser.UpdateMeInput{
		Name:                 input.Name,
		Email:                input.Email,
		Lang:                 input.Lang,
		Theme:                input.Theme,
		Password:             input.Password,
		PasswordConfirmation: input.PasswordConfirmation,
	}
	return a.client.UserRepo.UpdateMe(ctx, updateInput)
}

func (a *accountGateway) FindWorkspacesByUser(ctx context.Context, userID string) (workspace.List, error) {
	return a.client.WorkspaceRepo.FindByUser(ctx, userID)
}

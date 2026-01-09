package account

import (
	"context"
	"net/http"

	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	"github.com/reearth/reearth-accounts/server/pkg/user"
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

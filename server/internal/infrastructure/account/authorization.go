package account

import (
	"context"
	"net/http"

	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	"github.com/reearth/reearth-accounts/server/pkg/gqlclient/cerbos"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
)

type authorizationGateway struct {
	client *gqlclient.Client
}

func NewAuthorization(host string, timeout int, transport http.RoundTripper) gateway.Authorization {
	return &authorizationGateway{
		client: gqlclient.NewClient(host, timeout, transport),
	}
}

func (a *authorizationGateway) CheckPermission(ctx context.Context, resource string, action string, workspaceAlias ...string) (bool, error) {
	param := cerbos.CheckPermissionParam{
		Service:  "cms",
		Resource: resource,
		Action:   action,
	}
	if len(workspaceAlias) > 0 {
		param.WorkspaceAlias = &workspaceAlias[0]
	}

	result, err := a.client.CerbosRepo.CheckPermission(ctx, param)
	if err != nil {
		return false, err
	}

	return result.Allowed, nil
}

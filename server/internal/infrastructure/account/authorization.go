package account

import (
	"context"
	"net/http"

	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	"github.com/reearth/reearth-accounts/server/pkg/gqlclient/cerbos"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
)

type authorizationGateway struct {
	client *gqlclient.Client
}

func NewAuthorization(host string, timeout int, transport http.RoundTripper) gateway.Authorization {
	return &authorizationGateway{
		client: gqlclient.NewClient(host, timeout, transport),
	}
}

func (a *authorizationGateway) CheckPermission(ctx context.Context, resource rbac.Resource, action rbac.Action, workspaceID *workspace.ID) (bool, error) {
	param := cerbos.CheckPermissionParam{
		Service:  "cms",
		Resource: resource,
		Action:   action,
	}
	if workspaceID != nil {
		alias := workspaceID.String()
		param.WorkspaceAlias = &alias
	}

	result, err := a.client.CerbosRepo.CheckPermission(ctx, param)
	if err != nil {
		return false, err
	}

	return result.Allowed, nil
}

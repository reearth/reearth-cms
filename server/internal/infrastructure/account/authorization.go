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

func (a *authorizationGateway) CheckPermission(ctx context.Context, input gateway.AuthorizationInput) (bool, error) {

	workspaceAlias := input.WorkspaceID.String()

	param := cerbos.CheckPermissionParam{
		Service:        "cms",
		Resource:       input.Resource.Type + ":" + input.Resource.ID,
		Action:         input.Action,
		WorkspaceAlias: &workspaceAlias,
	}

	result, err := a.client.CerbosRepo.CheckPermission(ctx, param)
	if err != nil {
		return false, err
	}

	return result.Allowed, nil
}

func (a *authorizationGateway) CheckPermissions(ctx context.Context, inputs []gateway.AuthorizationInput) ([]bool, error) {

	results := make([]bool, len(inputs))
	for i, input := range inputs {
		allowed, err := a.CheckPermission(ctx, input)
		if err != nil {
			return nil, err
		}
		results[i] = allowed
	}

	return results, nil
}

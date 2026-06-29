package account

import (
	"context"
	"net/http"
	"sync/atomic"

	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	"github.com/reearth/reearth-accounts/server/pkg/gqlclient/cerbos"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/log"
	"golang.org/x/sync/errgroup"
)

type authorizationGateway struct {
	client *gqlclient.Client
}

func NewAuthorization(host string, timeout int, transport http.RoundTripper) gateway.Authorization {
	return &authorizationGateway{
		client: gqlclient.NewClient(host, timeout, transport),
	}
}

func (a *authorizationGateway) CheckPermission(ctx context.Context, resource rbac.Resource, action rbac.Action, workspaceIDs ...workspace.ID) (bool, error) {
	param := cerbos.CheckPermissionParam{
		Service:  rbac.ServiceName,
		Resource: resource,
		Action:   action,
	}
	if len(workspaceIDs) == 0 {
		res, err := a.client.CerbosRepo.CheckPermission(ctx, param)
		if err != nil {
			return false, err
		}
		return res.Allowed, nil
	}

	eg, egCtx := errgroup.WithContext(ctx)
	var denied atomic.Bool
	for _, ws := range workspaceIDs {
		eg.Go(func() error {
			p := param
			p.WorkspaceAlias = ws.StringRef()
			res, err := a.client.CerbosRepo.CheckPermission(egCtx, p)
			if err != nil {
				return err
			}
			if !res.Allowed {
				log.Warnf("permission denied for resource %s, action %s, workspace %s", resource, action, ws)
				denied.Store(true)
			}
			return nil
		})
	}

	if err := eg.Wait(); err != nil {
		return false, err
	}
	return !denied.Load(), nil
}

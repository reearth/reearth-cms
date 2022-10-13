package app

import (
	"context"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearthx/rerror"
)

func authMiddleware(cfg *ServerConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) (err error) {
			req := c.Request()
			ctx := req.Context()

			var userID string
			var u *user.User

			// get sub from context
			au := adapter.GetAuthInfo(ctx)
			if uId, ok := ctx.Value(contextUser).(string); ok {
				userID = uId
			}

			var integrationToken string
			var i *integration.Integration

			// get integration token if presented
			if token := req.Header.Get("authorization"); strings.HasPrefix(token, "secret_") {
				integrationToken = token
			}

			// debug mode
			if cfg.Debug {
				if userID := c.Request().Header.Get(debugUserHeader); userID != "" {
					if uId, err := id.UserIDFrom(userID); err == nil {
						user2, err := cfg.Repos.User.FindByID(ctx, uId)
						if err == nil && user2 != nil {
							u = user2
						}
					}
				}
				if integrationID := c.Request().Header.Get(debugIntegrationHeader); integrationID != "" {
					if iId, err := id.IntegrationIDFrom(integrationID); err == nil {
						integration2, err := cfg.Repos.Integration.FindByID(ctx, iId)
						if err == nil && integration2 != nil {
							i = integration2
						}
					}
				}
			}

			if u == nil && userID != "" {
				if userID2, err := id.UserIDFrom(userID); err == nil {
					u, err = cfg.Repos.User.FindByID(ctx, userID2)
					if err != nil && err != rerror.ErrNotFound {
						return err
					}
				} else {
					return err
				}
			}

			if u == nil && au != nil {
				var err error
				// find user
				u, err = cfg.Repos.User.FindBySub(ctx, au.Sub)
				if err != nil && err != rerror.ErrNotFound {
					return err
				}
			}

			// save a new sub
			if u != nil && au != nil {
				if err = addSubToUser(ctx, u, user.AuthFromAuth0Sub(au.Sub), cfg); err != nil {
					return err
				}
			}

			if i == nil && integrationToken != "" {
				i, err = cfg.Repos.Integration.FindByToken(ctx, integrationToken)
				if err != nil {
					return err
				}
			}

			var op *usecase.Operator
			if u != nil {
				if op, err = generateUserOperator(ctx, cfg, u); err != nil {
					return err
				}
				ctx = adapter.AttachUser(ctx, u)
			}
			if i != nil {
				if op, err = generateIntegrationOperator(ctx, cfg, i); err != nil {
					return err
				}
			}
			if op != nil {
				ctx = adapter.AttachOperator(ctx, op)
			}

			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}

func generateUserOperator(ctx context.Context, cfg *ServerConfig, u *user.User) (*usecase.Operator, error) {
	if u == nil {
		return nil, nil
	}

	uid := u.ID()
	workspaces, err := cfg.Repos.Workspace.FindByUser(ctx, uid)
	if err != nil {
		return nil, err
	}

	readableWorkspaces := workspaces.FilterByUserRole(uid, user.RoleReader).IDs()
	writableWorkspaces := workspaces.FilterByUserRole(uid, user.RoleWriter).IDs()
	owningWorkspaces := workspaces.FilterByUserRole(uid, user.RoleOwner).IDs()

	return &usecase.Operator{
		User:               &uid,
		ReadableWorkspaces: readableWorkspaces,
		WritableWorkspaces: writableWorkspaces,
		OwningWorkspaces:   owningWorkspaces,
	}, nil
}

func generateIntegrationOperator(ctx context.Context, cfg *ServerConfig, i *integration.Integration) (*usecase.Operator, error) {
	if i == nil {
		return nil, nil
	}

	iId := i.ID()
	workspaces, err := cfg.Repos.Workspace.FindByIntegration(ctx, iId)
	if err != nil {
		return nil, err
	}

	readableWorkspaces := workspaces.FilterByIntegrationRole(iId, user.RoleReader).IDs()
	writableWorkspaces := workspaces.FilterByIntegrationRole(iId, user.RoleWriter).IDs()
	owningWorkspaces := workspaces.FilterByIntegrationRole(iId, user.RoleOwner).IDs()

	return &usecase.Operator{
		Integration:        &iId,
		ReadableWorkspaces: readableWorkspaces,
		WritableWorkspaces: writableWorkspaces,
		OwningWorkspaces:   owningWorkspaces,
	}, nil
}

func addSubToUser(ctx context.Context, u *user.User, a user.Auth, cfg *ServerConfig) error {
	if u.AddAuth(a) {
		err := cfg.Repos.User.Save(ctx, u)
		if err != nil {
			return err
		}
	}
	return nil
}

func AuthRequiredMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := c.Request().Context()
			if adapter.Operator(ctx) == nil {
				return echo.ErrUnauthorized
			}
			return next(c)
		}
	}
}

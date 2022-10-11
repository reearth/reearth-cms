package app

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/rerror"
)

var contextAuthInfo = struct{}{}

const debugUserHeader = "X-Reearth-Debug-User"

func authMiddleware(cfg *ServerConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			var ai *appx.AuthInfo
			var userID string
			var u *user.User

			// get sub from context
			if ai2, ok := ctx.Value(contextAuthInfo).(*appx.AuthInfo); ok {
				ai = ai2
			}

			// debug mode
			if cfg.Debug {
				if userID := c.Request().Header.Get(debugUserHeader); userID != "" {
					if id, err := id.UserIDFrom(userID); err == nil {
						user2, err := cfg.Repos.User.FindByID(ctx, id)
						if err == nil && user2 != nil {
							u = user2
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

			if u == nil && ai != nil {
				var err error
				// find user
				u, err = cfg.Repos.User.FindBySub(ctx, ai.Sub)
				if err != nil && err != rerror.ErrNotFound {
					return err
				}
			}

			// save a new sub
			if u != nil && ai != nil {
				if err := addSubToUser(ctx, u, user.AuthFromAuth0Sub(ai.Sub), cfg); err != nil {
					return err
				}
			}

			if u != nil {
				op, err := generateOperator(ctx, cfg, u)
				if err != nil {
					return err
				}

				ctx = adapter.AttachUser(ctx, u)
				ctx = adapter.AttachOperator(ctx, op)
			}

			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}

func generateOperator(ctx context.Context, cfg *ServerConfig, u *user.User) (*usecase.Operator, error) {
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
		User:               uid,
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

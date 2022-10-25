package app

import (
	"context"
	"errors"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

func authMiddleware(cfg *ServerConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) (err error) {
			req := c.Request()
			ctx := req.Context()

			// get sub from context
			ai := adapter.GetAuthInfo(ctx)

			// find or create user
			if ai != nil {
				var u *user.User
				var err error
				userUsecase := interactor.NewUser(cfg.Repos, cfg.Gateways, cfg.Config.SignupSecret, cfg.Config.Host_Web)
				u, err = userUsecase.FindOrCreate(ctx, interfaces.UserFindOrCreateParam{
					Sub:   ai.Sub,
					ISS:   ai.Iss,
					Token: ai.Token,
				})
				if err != nil {
					return err
				}

				op, err := generateUserOperator(ctx, cfg, u)
				if err != nil {
					return err
				}

				ctx = adapter.AttachUser(ctx, u)
				ctx = adapter.AttachOperator(ctx, op)
			}

			// get integration token if presented
			token := req.Header.Get("authorization")
			if !strings.HasPrefix(token, "secret_") {
				return errors.New("invalid integration token")
			}

			if token != "" {
				var i *integration.Integration
				var err error
				i, err = cfg.Repos.Integration.FindByToken(ctx, token)
				if err != nil {
					return err
				}

				op, err := generateIntegrationOperator(ctx, cfg, i)
				if err != nil {
					return err
				}

				ctx = adapter.AttachOperator(ctx, op)
			}

			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}

func jwtEchoMiddleware(cfg *ServerConfig) echo.MiddlewareFunc {
	mw := lo.Must(appx.AuthMiddleware(cfg.Config.JWTProviders(), adapter.ContextAuthInfo, true))
	return echo.WrapMiddleware(mw)
}

func generateUserOperator(ctx context.Context, cfg *ServerConfig, u *user.User) (*usecase.Operator, error) {
	if u == nil {
		return nil, nil
	}

	uid := u.ID()

	w, err := cfg.Repos.Workspace.FindByUser(ctx, uid)
	if err != nil {
		return nil, err
	}

	rw := w.FilterByUserRole(uid, user.RoleReader).IDs()
	ww := w.FilterByUserRole(uid, user.RoleWriter).IDs()
	ow := w.FilterByUserRole(uid, user.RoleOwner).IDs()

	rp, wp, op, err := operatorProjects(ctx, cfg, w, rw, ww, ow)
	if err != nil {
		return nil, err
	}

	return &usecase.Operator{
		User:               &uid,
		Integration:        nil,
		ReadableWorkspaces: rw,
		WritableWorkspaces: ww,
		OwningWorkspaces:   ow,
		ReadableProjects:   rp,
		WritableProjects:   wp,
		OwningProjects:     op,
	}, nil
}

func operatorProjects(ctx context.Context, cfg *ServerConfig, w user.WorkspaceList, rw, ww, ow user.WorkspaceIDList) (id.ProjectIDList, id.ProjectIDList, id.ProjectIDList, error) {
	rp := id.ProjectIDList{}
	wp := id.ProjectIDList{}
	op := id.ProjectIDList{}

	var cur *usecasex.Cursor
	for {
		projects, pi, err := cfg.Repos.Project.FindByWorkspaces(ctx, w.IDs(), &usecasex.Pagination{
			After: cur,
			First: lo.ToPtr(100),
		})
		if err != nil {
			return nil, nil, nil, err
		}

		for _, p := range projects {
			if ow.Has(p.Workspace()) {
				op = append(op, p.ID())
			} else if ww.Has(p.Workspace()) {
				wp = append(wp, p.ID())
			} else if rw.Has(p.Workspace()) {
				rp = append(rp, p.ID())
			}
		}

		if !pi.HasNextPage {
			break
		}
		cur = pi.EndCursor
	}
	return rp, wp, op, nil
}

func generateIntegrationOperator(ctx context.Context, cfg *ServerConfig, i *integration.Integration) (*usecase.Operator, error) {
	if i == nil {
		return nil, nil
	}

	iId := i.ID()
	w, err := cfg.Repos.Workspace.FindByIntegration(ctx, iId)
	if err != nil {
		return nil, err
	}

	rw := w.FilterByIntegrationRole(iId, user.RoleReader).IDs()
	ww := w.FilterByIntegrationRole(iId, user.RoleWriter).IDs()
	ow := w.FilterByIntegrationRole(iId, user.RoleOwner).IDs()

	rp, wp, op, err := operatorProjects(ctx, cfg, w, rw, ww, ow)
	if err != nil {
		return nil, err
	}

	return &usecase.Operator{
		User:               nil,
		Integration:        &iId,
		ReadableWorkspaces: rw,
		WritableWorkspaces: ww,
		OwningWorkspaces:   ow,
		ReadableProjects:   rp,
		WritableProjects:   wp,
		OwningProjects:     op,
	}, nil
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

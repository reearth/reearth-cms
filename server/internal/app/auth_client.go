package app

import (
	"context"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/user"
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
			strings.HasPrefix(token, "secret_")

			if token != "" {
				var i *integration.Integration
				var err error
				i, err = cfg.Repos.Integration.FindByToken(ctx, integrationToken)
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

	readableProjects := id.ProjectIDList{}
	writableProjects := id.ProjectIDList{}
	owningProjects := id.ProjectIDList{}

	var cur *usecasex.Cursor
	for {
		projects, pi, err := cfg.Repos.Project.FindByWorkspaces(ctx, workspaces.IDs(), &usecasex.Pagination{
			After: cur,
			First: lo.ToPtr(100),
		})
		if err != nil {
			return nil, err
		}

		for _, p := range projects {
			if owningWorkspaces.Has(p.Workspace()) {
				owningProjects = append(owningProjects, p.ID())
			} else if writableWorkspaces.Has(p.Workspace()) {
				writableProjects = append(writableProjects, p.ID())
			} else if readableWorkspaces.Has(p.Workspace()) {
				readableProjects = append(readableProjects, p.ID())
			}
		}

		if !pi.HasNextPage {
			break
		}
		cur = pi.EndCursor
	}

	return &usecase.Operator{
		User:               &uid,
		ReadableWorkspaces: readableWorkspaces,
		WritableWorkspaces: writableWorkspaces,
		OwningWorkspaces:   owningWorkspaces,
		ReadableProjects:   readableProjects,
		WritableProjects:   writableProjects,
		OwningProjects:     owningProjects,
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
		ReadableProjects:   readableProjects,
		WritableProjects:   writableProjects,
		OwningProjects:     owningProjects,
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

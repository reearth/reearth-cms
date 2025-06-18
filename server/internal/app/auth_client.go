package app

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountinteractor"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

var (
	debugUserHeaderKey        = "X-Reearth-Debug-User"
	debugIntegrationHeaderKey = "X-Reearth-Debug-Integration"
)

func authMiddleware(appCtx *ApplicationContext) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) (err error) {
			req := c.Request()
			ctx := req.Context()

			ctx, err = attachUserOperator(ctx, req, appCtx)
			if err != nil {
				return err
			}

			ctx, err = attachIntegrationOperator(ctx, req, appCtx)
			if err != nil {
				return err
			}

			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}

func attachUserOperator(ctx context.Context, req *http.Request, appCtx *ApplicationContext) (context.Context, error) {
	var u *user.User

	if ai := adapter.GetAuthInfo(ctx); ai != nil {
		var err error
		userUsecase := accountinteractor.NewMultiUser(appCtx.AcRepos, appCtx.AcGateways, appCtx.Config.SignupSecret, appCtx.Config.Host_Web, appCtx.AcRepos.Users)
		u, err = userUsecase.FetchBySub(ctx, ai.Sub)
		if err != nil {
			return nil, err
		}
	}

	if appCtx.Debug {
		if val := req.Header.Get(debugUserHeaderKey); val != "" {
			uId, err := accountdomain.UserIDFrom(val)
			if err != nil {
				return nil, err
			}
			us, err := appCtx.Repos.User.FindByID(ctx, uId)
			if err == nil {
				u = us
			}
		}
	}

	// generate operator
	if u != nil {
		defaultLang := req.Header.Get("Accept-Language")
		op, err := generateUserOperator(ctx, appCtx, u, defaultLang)
		if err != nil {
			return nil, err
		}
		ctx = adapter.AttachUser(ctx, u)
		ctx = adapter.AttachOperator(ctx, op)
	}

	return ctx, nil
}

func attachIntegrationOperator(ctx context.Context, req *http.Request, appCtx *ApplicationContext) (context.Context, error) {
	var i *integration.Integration
	if token := getKey(req); token != "" {
		var err error
		i, err = appCtx.Repos.Integration.FindByToken(ctx, token)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return nil, echo.ErrUnauthorized
			}
			return nil, err
		}
	}

	if appCtx.Debug {
		if val := req.Header.Get(debugIntegrationHeaderKey); val != "" {
			iId, err := id.IntegrationIDFrom(val)
			if err != nil {
				return nil, err
			}
			i, err = appCtx.Repos.Integration.FindByID(ctx, iId)
			if err != nil {
				return nil, err
			}
		}
	}

	if i != nil {
		defaultLang := req.Header.Get("Accept-Language")
		op, err := generateIntegrationOperator(ctx, appCtx, i, defaultLang)
		if err != nil {
			return nil, err
		}

		ctx = adapter.AttachOperator(ctx, op)
	}

	return ctx, nil
}

func publicAPIAuthMiddleware(appCtx *ApplicationContext) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()
			key := getKey(req)
			if key == "" {
				return next(c)
			}

			p, err := appCtx.Repos.Project.FindByPublicAPIKey(ctx, key)
			if err != nil {
				if errors.Is(err, rerror.ErrNotFound) {
					return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid key"})
				}
				return err
			}

			ctx = adapter.AttachAPIKeyId(ctx, p.Accessibility().APIKeyByKey(key).ID().Ref())
			c.SetRequest(req.WithContext(ctx))

			return next(c)
		}
	}
}

func getKey(req *http.Request) string {
	token := strings.TrimPrefix(req.Header.Get("authorization"), "Bearer ")
	if strings.HasPrefix(token, "secret_") {
		return token
	}
	return ""
}

func generateUserOperator(ctx context.Context, appCtx *ApplicationContext, u *user.User, defaultLang string) (*usecase.Operator, error) {
	if u == nil {
		return nil, nil
	}

	uid := u.ID()

	w, err := appCtx.Repos.Workspace.FindByUser(ctx, uid)
	if err != nil {
		return nil, err
	}

	rw := w.FilterByUserRole(uid, workspace.RoleReader).IDs()
	ww := w.FilterByUserRole(uid, workspace.RoleWriter).IDs()
	mw := w.FilterByUserRole(uid, workspace.RoleMaintainer).IDs()
	ow := w.FilterByUserRole(uid, workspace.RoleOwner).IDs()

	rp, wp, mp, op, err := operatorProjects(ctx, appCtx, w, rw, ww, mw, ow)
	if err != nil {
		return nil, err
	}

	lang := u.Metadata().Lang().String()
	if lang == "" || lang == "und" {
		lang = defaultLang
	}

	acop := &accountusecase.Operator{
		User: &uid,

		ReadableWorkspaces:     rw,
		WritableWorkspaces:     ww,
		MaintainableWorkspaces: mw,
		OwningWorkspaces:       ow,
	}

	return &usecase.Operator{
		Integration:          nil,
		Lang:                 lang,
		ReadableProjects:     rp,
		WritableProjects:     wp,
		MaintainableProjects: mp,
		OwningProjects:       op,

		AcOperator: acop,
	}, nil
}

func operatorProjects(ctx context.Context, appCtx *ApplicationContext, w workspace.List, rw, ww, mw, ow user.WorkspaceIDList) (id.ProjectIDList, id.ProjectIDList, id.ProjectIDList, id.ProjectIDList, error) {
	rp := id.ProjectIDList{}
	wp := id.ProjectIDList{}
	mp := id.ProjectIDList{}
	op := id.ProjectIDList{}

	if len(w) == 0 {
		return rp, wp, op, mp, nil
	}
	var cur *usecasex.Cursor
	for {
		projects, pi, err := appCtx.Repos.Project.FindByWorkspaces(ctx, w.IDs(), usecasex.CursorPagination{
			After: cur,
			First: lo.ToPtr(int64(100)),
		}.Wrap())
		if err != nil {
			return nil, nil, nil, nil, err
		}

		for _, p := range projects {
			if ow.Has(p.Workspace()) {
				op = append(op, p.ID())
			} else if mw.Has(p.Workspace()) {
				mp = append(mp, p.ID())
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
	return rp, wp, mp, op, nil
}

func generateIntegrationOperator(ctx context.Context, appCtx *ApplicationContext, i *integration.Integration, lang string) (*usecase.Operator, error) {
	if i == nil {
		return nil, nil
	}

	iId := i.ID()
	aid, err := accountdomain.IntegrationIDFrom(iId.String())
	if err != nil {
		return nil, err
	}
	w, err := appCtx.Repos.Workspace.FindByIntegration(ctx, aid)
	if err != nil {
		return nil, err
	}

	rw := w.FilterByIntegrationRole(aid, workspace.RoleReader).IDs()
	ww := w.FilterByIntegrationRole(aid, workspace.RoleWriter).IDs()
	mw := w.FilterByIntegrationRole(aid, workspace.RoleMaintainer).IDs()
	ow := w.FilterByIntegrationRole(aid, workspace.RoleOwner).IDs()

	rp, wp, mp, op, err := operatorProjects(ctx, appCtx, w, rw, ww, mw, ow)
	if err != nil {
		return nil, err
	}

	return &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:                   nil,
			ReadableWorkspaces:     rw,
			WritableWorkspaces:     ww,
			MaintainableWorkspaces: mw,
			OwningWorkspaces:       ow,
		},
		Integration:          &iId,
		Lang:                 lang,
		ReadableProjects:     rp,
		WritableProjects:     wp,
		MaintainableProjects: mp,
		OwningProjects:       op,
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

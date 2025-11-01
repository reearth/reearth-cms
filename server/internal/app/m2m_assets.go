package app

import (
	"errors"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/rerror"
)

func M2MAssetHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		if strings.HasSuffix(c.Path(), "/is-private") {
			return handleAssetIsPrivate(c)
		}

		return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
	}
}

func handleAssetIsPrivate(c echo.Context) error {
	ctx := c.Request().Context()

	uuid := c.Param("uuid")
	if uuid == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing uuid"})
	}

	op := adapter.Operator(ctx)
	if op == nil || !op.Machine {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	uc := adapter.Usecases(ctx)
	if uc == nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal error"})
	}

	asset, err := uc.Asset.FindByUUID(ctx, uuid, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "asset not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to find asset"})
	}

	pl, err := uc.Project.Fetch(ctx, project.IDList{asset.Project()}, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "project not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to find project"})
	}
	if len(pl) == 0 {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "project not found"})
	}
	proj := pl[0]

	isPrivate := proj.Accessibility() != nil && proj.Accessibility().Visibility() == project.VisibilityPrivate

	return c.JSON(http.StatusOK, map[string]interface{}{
		"isPrivate":   isPrivate,
		"workspaceId": proj.Workspace().String(),
		"projectId":   proj.ID().String(),
	})
}

func M2MTokenAuthMiddleware(token string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if token == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "m2m not configured"})
			}

			auth := c.Request().Header.Get("Authorization")
			if auth == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing authorization"})
			}

			const bearerPrefix = "Bearer "
			if !strings.HasPrefix(auth, bearerPrefix) {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid authorization format"})
			}

			providedToken := strings.TrimPrefix(auth, bearerPrefix)
			if providedToken != token {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token"})
			}

			op, err := generateMachineOperator()
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to generate operator"})
			}

			ctx := adapter.AttachOperator(c.Request().Context(), op)
			c.SetRequest(c.Request().WithContext(ctx))

			return next(c)
		}
	}
}

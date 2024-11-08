package app

import (
	"io"
	"mime"
	"net/http"
	"path"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearthx/rerror"
)

func serveFiles(e *echo.Echo, cfg *ServerConfig) {
	if cfg.Gateways.File == nil {
		return
	}

	eh := func(c echo.Context) error { return nil }
	authMiddleware := authMiddleware(cfg)(eh)
	jwtParseMiddleware := jwtParseMiddleware(cfg)(eh)

	m := func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			token := ctx.Request().Header.Get("Authorization")

			if cfg.Config.Asset_Public || token == "" || !strings.HasPrefix(token, "Bearer ") {
				return next(ctx)
			}

			if strings.HasPrefix(token, "Bearer secret_") {
				_ = authMiddleware(ctx)
			} else {
				_ = jwtParseMiddleware(ctx)
				_ = authMiddleware(ctx)
			}

			return next(ctx)
		}
	}

	streamFile := func(ctx echo.Context, fileName string, reader io.Reader) error {
		ct := "application/octet-stream"
		if ext := path.Ext(fileName); ext != "" {
			ct2 := mime.TypeByExtension(ext)
			if ct2 != "" {
				ct = ct2
			}
		}
		return ctx.Stream(http.StatusOK, ct, reader)
	}

	e.GET("/assets/:uuid1/:uuid2/:filename", func(ctx echo.Context) error {
		filename := ctx.Param("filename")
		uuid := ctx.Param("uuid1") + ctx.Param("uuid2")
		if !cfg.Config.Asset_Public {
			a, err := cfg.Repos.Asset.FindByUUID(ctx.Request().Context(), uuid)
			if err != nil {
				return err
			}
			if a != nil && !a.Public() {
				op := adapter.Operator(ctx.Request().Context())
				if op == nil || !op.IsReadableProject(a.Project()) {
					return rerror.ErrNotFound
				}
			}
		}
		r, err := cfg.Gateways.File.ReadAsset(ctx.Request().Context(), uuid, filename)
		if err != nil {
			return err
		}
		return streamFile(ctx, filename, r)
	}, m)
}

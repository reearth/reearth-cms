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

	streamFile := func(ctx echo.Context, fileName string, reader io.Reader, headers map[string]string) error {
		if headers == nil {
			headers = map[string]string{}
		}
		for _, h := range headers {
			ctx.Response().Header().Set(h, headers[h])
		}

		if headers["Content-Type"] == "" {
			headers["Content-Type"] = "application/octet-stream"
			if ext := path.Ext(fileName); ext != "" {
				if ct := mime.TypeByExtension(ext); ct != "" {
					headers["Content-Type"] = ct
				}
			}
		}
		return ctx.Stream(http.StatusOK, headers["Content-Type"], reader)
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
		r, h, err := cfg.Gateways.File.ReadAsset(ctx.Request().Context(), uuid, filename, assetHeaders(ctx.Request().Header))
		if err != nil {
			return err
		}
		return streamFile(ctx, filename, r, h)
	}, m)

	e.GET("/assets/:filename", func(ctx echo.Context) error {
		filename := ctx.Param("filename")
		h := assetHeaders(ctx.Request().Header)
		r, headers, err := cfg.Gateways.File.Read(ctx.Request().Context(), filename, h)
		if err != nil {
			return err
		}
		return streamFile(ctx, filename, r, headers)
	})
}

func assetHeaders(h http.Header) map[string]string {
	res := map[string]string{}
	for k, v := range h {
		if len(v) == 0 {
			continue
		}
		res[k] = v[0]
	}
	return res
}

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

func serveFiles(e *echo.Group, appCtx *ApplicationContext) {
	if appCtx.Gateways.File == nil {
		return
	}
	e.GET("/:uuid1/:uuid2/:filename", handleAssetByUUID(appCtx), privateAssetsMiddleware(appCtx))
	e.GET("/:filename", handleAssetByFileName(appCtx))
}

func privateAssetsMiddleware(appCtx *ApplicationContext) echo.MiddlewareFunc {
	eh := func(c echo.Context) error { return nil }
	authHandler := authMiddleware(appCtx)(eh)
	jwtHandler := jwtParseMiddleware(appCtx)(eh)

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			token := ctx.Request().Header.Get("Authorization")

			if appCtx.Config.Asset_Public || token == "" || !strings.HasPrefix(token, "Bearer ") {
				return next(ctx)
			}

			if strings.HasPrefix(token, "Bearer secret_") {
				_ = authHandler(ctx)
			} else {
				_ = jwtHandler(ctx)
				_ = authHandler(ctx)
			}

			return next(ctx)
		}
	}
}

func handleAssetByUUID(appCtx *ApplicationContext) echo.HandlerFunc {
	return func(ctx echo.Context) error {
		uuid := ctx.Param("uuid1") + ctx.Param("uuid2")
		reqCtx := ctx.Request().Context()

		a, err := appCtx.Repos.Asset.FindByUUID(reqCtx, uuid)
		if err != nil {
			return err
		}

		if !appCtx.Config.Asset_Public && (a == nil || (!a.Public() && (adapter.Operator(reqCtx) == nil || !adapter.Operator(reqCtx).IsReadableProject(a.Project())))) {
			return rerror.ErrNotFound
		}

		// Resolve the storage filename from AssetFile rather than the URL parameter,
		// since asset.FileName may have been normalized after the file was uploaded.
		filename := ctx.Param("filename")
		if a != nil {
			if af, err := appCtx.Repos.AssetFile.FindByID(reqCtx, a.ID()); err == nil && af.Path() != "" {
				filename = af.Path()
			}
		}

		r, h, err := appCtx.Gateways.File.ReadAsset(reqCtx, uuid, filename, assetHeaders(ctx.Request().Header))
		if err != nil {
			return err
		}
		return streamFile(ctx, filename, r, h)
	}
}

func handleAssetByFileName(appCtx *ApplicationContext) echo.HandlerFunc {
	return func(ctx echo.Context) error {
		filename := ctx.Param("filename")
		r, h, err := appCtx.Gateways.File.Read(
			ctx.Request().Context(), filename, assetHeaders(ctx.Request().Header),
		)
		if err != nil {
			return err
		}
		return streamFile(ctx, filename, r, h)
	}
}

func streamFile(c echo.Context, fileName string, reader io.Reader, headers map[string]string) error {
	if headers == nil {
		headers = make(map[string]string)
	}
	for key, val := range headers {
		c.Response().Header().Set(key, val)
	}
	if headers["Content-Type"] == "" {
		headers["Content-Type"] = "application/octet-stream"
		if ext := path.Ext(fileName); ext != "" {
			if ct := mime.TypeByExtension(ext); ct != "" {
				headers["Content-Type"] = ct
			}
		}
	}
	return c.Stream(http.StatusOK, headers["Content-Type"], reader)
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

package app

import (
	"io"
	"mime"
	"net/http"
	"path"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
)

func serveFiles(
	ec *echo.Echo,
	repo gateway.File,
) {
	if repo == nil {
		return
	}

	fileHandler := func(handler func(echo.Context) (io.Reader, string, map[string]string, error)) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			reader, filename, headers, err := handler(ctx)
			if err != nil {
				return err
			}

			if headers == nil {
				headers = map[string]string{}
			}
			for _, h := range headers {
				ctx.Response().Header().Set(h, headers[h])
			}

			if headers["Content-Type"] == "" {
				headers["Content-Type"] = "application/octet-stream"
				if ext := path.Ext(filename); ext != "" {
					ct2 := mime.TypeByExtension(ext)
					if ct2 != "" {
						headers["Content-Type"] = ct2
					}
				}
			}

			return ctx.Stream(http.StatusOK, headers["Content-Type"], reader)
		}
	}

	ec.GET(
		"/assets/:uuid1/:uuid2/:filename",
		fileHandler(func(ctx echo.Context) (io.Reader, string, map[string]string, error) {
			filename := ctx.Param("filename")
			uuid1 := ctx.Param("uuid1")
			uuid2 := ctx.Param("uuid2")
			uuid := uuid1 + uuid2
			h := assetHeaders(ctx.Request().Header)
			r, headers, err := repo.ReadAsset(ctx.Request().Context(), uuid, filename, h)
			return r, filename, headers, err
		}),
	)
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

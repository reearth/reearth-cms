package publicapi

import (
	"bytes"
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type contextKey string

func (c contextKey) String() string {
	return "public_api_" + string(c)
}

var controllerCK = contextKey("controller")

const defaultLimit = 50
const maxLimit = 100

func AttachController(ctx context.Context, c *Controller) context.Context {
	return context.WithValue(ctx, controllerCK, c)
}

func GetController(ctx context.Context) *Controller {
	return ctx.Value(controllerCK).(*Controller)
}

func Echo(e *echo.Group) {

	// --- Public API routing ---
	// ws: workspace (id or alias)
	// p: project (id or alias)
	// m: model (id or key), it can be "assets" for assets
	// i: item id

	// /:ws/:p/:m
	// /:ws/:p/:m.json
	// /:ws/:p/:m.csv
	// /:ws/:p/:m.geojson
	// /:ws/:p/:m.schema.json
	// /:ws/:p/:m.metadata_schema.json
	// /:ws/:p/:m.zip
	// /:ws/:p/:m/:i

	e.GET("/:workspace/:project/:sub-route", SubRoute())
	e.GET("/:workspace/:project/:model/:item", ItemOrAsset())
	e.GET("/:workspace/:project", OpenAPISchema())
}

// SubRoute since echo supports only / separated params, we need to route inside the handler
func SubRoute() echo.HandlerFunc {
	return func(c echo.Context) error {
		wsAlias, pAlias := c.Param("workspace"), c.Param("project")
		subRoute := strings.ToLower(c.Param("sub-route"))

		switch {
		case strings.HasSuffix(subRoute, ".metadata_schema.json"):
			mKey := strings.TrimSuffix(subRoute, ".metadata_schema.json")
			return SchemaOrMetadataSchema(c, wsAlias, pAlias, mKey, "metadata_schema")
		case strings.HasSuffix(subRoute, ".schema.json"):
			mKey := strings.TrimSuffix(subRoute, ".schema.json")
			return SchemaOrMetadataSchema(c, wsAlias, pAlias, mKey, "schema")

		case subRoute == "assets":
			return Assets(c, wsAlias, pAlias, "assets", "")
		case strings.HasSuffix(subRoute, "assets.json"):
			return Assets(c, wsAlias, pAlias, "assets", "json")

		case strings.HasSuffix(subRoute, ".json"):
			mKey := strings.TrimSuffix(subRoute, ".json")
			return Items(c, wsAlias, pAlias, mKey, "json")
		case strings.HasSuffix(subRoute, ".csv"):
			mKey := strings.TrimSuffix(subRoute, ".csv")
			return Items(c, wsAlias, pAlias, mKey, "csv")
		case strings.HasSuffix(subRoute, ".geojson"):
			mKey := strings.TrimSuffix(subRoute, ".geojson")
			return Items(c, wsAlias, pAlias, mKey, "geojson")
		case !strings.Contains(subRoute, "."):
			mKey := subRoute
			return Items(c, wsAlias, pAlias, mKey, "json")

		default:
			return c.JSON(http.StatusNotFound, nil)
		}
	}
}

func SchemaOrMetadataSchema(c echo.Context, wsAlias, pAlias string, mKey string, schemaType string) error {
	ctx := c.Request().Context()
	ctrl := GetController(ctx)

	if schemaType != "schema" && schemaType != "metadata_schema" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid schema type"})
	}

	res, err := ctrl.GetSchemaJSON(ctx, wsAlias, pAlias, mKey, schemaType)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}

func Assets(c echo.Context, wsAlias, pAlias, model, ext string) error {
	ctx := c.Request().Context()
	ctrl := GetController(ctx)

	if model != "assets" || (ext != "json" && ext != "") {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	p := paginationFrom(c)

	w := bytes.NewBuffer(nil)

	err := ctrl.GetAssets(ctx, wsAlias, pAlias, p, w)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
		}
		return err
	}

	return c.JSONBlob(http.StatusOK, w.Bytes())
}

func Items(c echo.Context, wsAlias, pAlias, mKey, ext string) error {
	ctx := c.Request().Context()
	ctrl := GetController(ctx)

	requestStart := time.Now()
	log.Debugfc(ctx, "publicapi: [START] Items request for ws=%s, p=%s, m=%s, ext=%s", wsAlias, pAlias, mKey, ext)

	p := paginationFrom(c)

	w := bytes.NewBuffer(nil)

	exportStart := time.Now()
	log.Debugfc(ctx, "publicapi: [START] GetPublicItems")
	err := ctrl.GetPublicItems(ctx, wsAlias, pAlias, mKey, ext, p, w)
	exportDuration := time.Since(exportStart)
	log.Debugfc(ctx, "publicapi: [END] GetPublicItems took %v", exportDuration)

	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
		}
		return err
	}

	contentType := "application/json"
	switch ext {
	case "json":
		contentType = "application/json"
	case "geojson":
		contentType = "application/geo+json"
	case "csv":
		contentType = "text/csv"
	}

	bufferSize := w.Len()
	log.Debugfc(ctx, "publicapi: Export complete - duration=%v, bufferSize=%d bytes", exportDuration, bufferSize)

	writeStart := time.Now()
	log.Debugfc(ctx, "publicapi: [START] Writing response to client")
	err = c.Blob(http.StatusOK, contentType, w.Bytes())
	writeDuration := time.Since(writeStart)
	totalDuration := time.Since(requestStart)
	log.Debugfc(ctx, "publicapi: [END] Response write took %v, total request duration=%v", writeDuration, totalDuration)

	return err
}

func ItemOrAsset() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(c.Request().Context())

		ws, p, m, i := c.Param("workspace"), c.Param("project"), c.Param("model"), c.Param("item")
		var res any
		var err error
		if m == "assets" {
			res, err = ctrl.GetAsset(ctx, ws, p, i)
		} else {
			res, err = ctrl.GetItem(ctx, ws, p, m, i)
		}

		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
			}
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

func paginationFrom(c echo.Context) *usecasex.Pagination {
	limit, _ := intParams(c, "limit", "perPage", "per_page", "page_size", "pageSize")
	if limit <= 0 {
		limit = defaultLimit
	} else if limit > 100 {
		limit = maxLimit
	}

	if startCursor := c.QueryParam("start_cursor"); startCursor != "" {
		return usecasex.CursorPagination{
			First: lo.ToPtr(limit),
			After: (*usecasex.Cursor)(&startCursor),
		}.Wrap()
	}

	if offset, ok := intParams(c, "offset"); ok {
		return usecasex.OffsetPagination{
			Offset: offset,
			Limit:  limit,
		}.Wrap()
	}

	if page, ok := intParams(c, "page"); ok {
		if page <= 0 {
			page = 1
		}
		return usecasex.OffsetPagination{
			Offset: (page - 1) * limit,
			Limit:  limit,
		}.Wrap()
	}

	if page, ok := intParams(c, "page"); ok {
		if page <= 0 {
			page = 1
		}
		return usecasex.OffsetPagination{
			Offset: (page - 1) * limit,
			Limit:  limit,
		}.Wrap()
	}

	return nil
}

func intParams(c echo.Context, params ...string) (int64, bool) {
	for _, p := range params {
		if q := c.QueryParam(p); q != "" {
			if p, err := strconv.ParseInt(q, 10, 64); err == nil {
				return p, true
			}
		}
	}
	return 0, false
}

func OpenAPISchema() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(ctx)

		ws, p := c.Param("workspace"), c.Param("project")

		res, err := ctrl.GetOpenAPISchema(ctx, ws, p)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
			}
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

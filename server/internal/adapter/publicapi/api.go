package publicapi

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
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

// maxPayloadBytes caps the raw posting request body before parsing (256 KB).
const maxPayloadBytes = 256 * 1024

func AttachController(ctx context.Context, c *Controller) context.Context {
	return context.WithValue(ctx, controllerCK, c)
}

func GetController(ctx context.Context) *Controller {
	return ctx.Value(controllerCK).(*Controller)
}

type RateLimitConfig struct {
	Rate      float64
	Burst     int
	ExpiresIn time.Duration
}

func Echo(e *echo.Group, rl RateLimitConfig) {

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
	e.POST("/:workspace/:project/:model/items", PostItem(), RateLimitMiddleware(rl))
	e.OPTIONS("/:workspace/:project/:model/items", PreflightItem())
}

// parseSubRoute splits a sub-route segment into a model key and extension.
// Compound extensions (.schema.json, .metadata_schema.json, .geojson) are
// checked first since path.Ext would only return the last component (.json).
func parseSubRoute(subRoute string) (name, ext string) {
	lower := strings.ToLower(subRoute)
	for _, compound := range []string{".metadata_schema.json", ".schema.json", ".geojson"} {
		if strings.HasSuffix(lower, compound) {
			return subRoute[:len(subRoute)-len(compound)], compound
		}
	}
	ext = path.Ext(lower)
	return subRoute[:len(subRoute)-len(ext)], ext
}

// SubRoute since echo supports only / separated params, we need to route inside the handler
func SubRoute() echo.HandlerFunc {
	return func(c *echo.Context) error {
		wsAlias, pAlias := c.Param("workspace"), c.Param("project")
		mKey, ext := parseSubRoute(c.Param("sub-route"))

		switch ext {
		case ".metadata_schema.json":
			return SchemaOrMetadataSchema(c, wsAlias, pAlias, mKey, "metadata_schema")
		case ".schema.json":
			return SchemaOrMetadataSchema(c, wsAlias, pAlias, mKey, "schema")
		case ".json":
			if mKey == "assets" {
				return Assets(c, wsAlias, pAlias, "assets", "json")
			}
			return Items(c, wsAlias, pAlias, mKey, "json")
		case ".csv":
			return Items(c, wsAlias, pAlias, mKey, "csv")
		case ".geojson":
			return Items(c, wsAlias, pAlias, mKey, "geojson")
		case "":
			if mKey == "assets" {
				return Assets(c, wsAlias, pAlias, "assets", "")
			}
			return Items(c, wsAlias, pAlias, mKey, "json")
		default:
			return c.JSON(http.StatusNotFound, nil)
		}
	}
}

func SchemaOrMetadataSchema(c *echo.Context, wsAlias, pAlias string, mKey string, schemaType string) error {
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

func Assets(c *echo.Context, wsAlias, pAlias, model, ext string) error {
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

func Items(c *echo.Context, wsAlias, pAlias, mKey, ext string) error {
	ctx := c.Request().Context()
	ctrl := GetController(ctx)

	p := paginationFrom(c)

	w := bytes.NewBuffer(nil)

	err := ctrl.GetPublicItems(ctx, wsAlias, pAlias, mKey, ext, p, w)
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

	return c.Blob(http.StatusOK, contentType, w.Bytes())
}

func ItemOrAsset() echo.HandlerFunc {
	return func(c *echo.Context) error {
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

func paginationFrom(c *echo.Context) *usecasex.Pagination {
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

	return nil
}

func intParams(c *echo.Context, params ...string) (int64, bool) {
	for _, p := range params {
		if q := c.QueryParam(p); q != "" {
			if p, err := strconv.ParseInt(q, 10, 64); err == nil {
				return p, true
			}
		}
	}
	return 0, false
}

type postItemRequest struct {
	Fields map[string]any `json:"fields"`
}

// isBrowserRequest reports whether the request carries an Origin header.
// Browsers always attach Origin to cross-origin requests, while non-browser
// clients (curl, SDKs, server-to-server) do not and are exempt from CORS.
func isBrowserRequest(origin string) bool {
	return origin != ""
}

// PostItem handles POST /:workspace/:project/:model/items to create a new item.
func PostItem() echo.HandlerFunc {
	return func(c *echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(ctx)

		ws, p, m := c.Param("workspace"), c.Param("project"), c.Param("model")
		origin := c.Request().Header.Get("Origin")

		wpm, err := ctrl.ValidatePostingAccess(ctx, ws, p, m, origin)
		if err != nil {
			return postingAccessErrorResponse(c, err)
		}

		r := c.Request()
		r.Body = http.MaxBytesReader(c.Response(), r.Body, maxPayloadBytes)

		var req postItemRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil && !errors.Is(err, io.EOF) {
			var maxBytesErr *http.MaxBytesError
			if errors.As(err, &maxBytesErr) {
				return c.JSON(http.StatusRequestEntityTooLarge, newAPIError(codePayloadTooLarge, msgPayloadTooLarge, nil))
			}
			return c.JSON(http.StatusBadRequest, newAPIError(codeInvalidJSON, msgInvalidJSON, nil))
		}
		if req.Fields == nil {
			req.Fields = map[string]any{}
		}
		result := ctrl.PostItem(ctx, wpm, req.Fields)
		if result.Err != nil {
			if errors.Is(result.Err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, newAPIError(codeNotFound, msgNotFound, nil))
			}
			return result.Err
		}

		if len(result.FieldErrors) > 0 {
			return c.JSON(http.StatusBadRequest, newAPIError(codeValidationError, msgValidationError, result.FieldErrors))
		}

		if isBrowserRequest(origin) {
			c.Response().Header().Set("Access-Control-Allow-Origin", origin)
		}

		return c.JSON(http.StatusAccepted, result.Item)
	}
}

// PreflightItem handles OPTIONS /:workspace/:project/:model/items for CORS preflight.
func PreflightItem() echo.HandlerFunc {
	return func(c *echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(ctx)

		ws, p, m := c.Param("workspace"), c.Param("project"), c.Param("model")
		origin := c.Request().Header.Get("Origin")

		if _, err := ctrl.ValidatePostingAccess(ctx, ws, p, m, origin); err != nil {
			return postingAccessErrorResponse(c, err)
		}

		// Non-browser requests are not real preflights — pass through without CORS headers.
		if isBrowserRequest(origin) {
			c.Response().Header().Set("Access-Control-Allow-Origin", origin)
			c.Response().Header().Set("Access-Control-Allow-Methods", "POST")
			c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type")
		}
		return c.NoContent(http.StatusNoContent)
	}
}

func OpenAPISchema() echo.HandlerFunc {
	return func(c *echo.Context) error {
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

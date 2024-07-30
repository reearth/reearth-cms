package publicapi

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

var contextKey = struct{}{}

const defaultLimit = 50
const maxLimit = 100

func AttachController(ctx context.Context, c *Controller) context.Context {
	return context.WithValue(ctx, contextKey, c)
}

func GetController(ctx context.Context) *Controller {
	return ctx.Value(contextKey).(*Controller)
}

func Echo(e *echo.Group) {
	e.Use(middleware.CORS())
	e.GET("/:project/:model", PublicApiItemList())
	e.GET("/:project/:model/:item", PublicApiItemOrAsset())
}

func PublicApiItemOrAsset() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(c.Request().Context())

		p, m, i := c.Param("project"), c.Param("model"), c.Param("item")
		var res any
		var err error
		if m == "assets" {
			res, err = ctrl.GetAsset(ctx, p, i)
		} else {
			res, err = ctrl.GetItem(ctx, p, m, i)
		}

		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

func PublicApiItemList() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(ctx)

		p, err := listParamFromEchoContext(c)
		if err != nil {
			return c.JSON(http.StatusBadRequest, "invalid offset or limit")
		}

		resType := ""
		m := c.Param("model")
		if strings.Contains(m, ".") {
			m, resType, _ = strings.Cut(m, ".")
		}
		if resType != "csv" && resType != "json" && resType != "geojson" {
			resType = "json"
		}

		res, s, err := ctrl.GetItems(ctx, c.Param("project"), m, p)
		if err != nil {
			return err
		}

		switch resType {
		case "csv":
			return toGeoCSV(c, res, s)
		case "geojson":
			return toGeoJSON(c, res, s)
		case "json":
			return c.JSON(http.StatusOK, res)
		default:
			return c.JSON(http.StatusOK, res)
		}
	}
}

func PublicApiAsset() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(c.Request().Context())

		res, err := ctrl.GetAsset(ctx, c.Param("project"), c.Param("asset"))
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

func listParamFromEchoContext(c echo.Context) (ListParam, error) {
	limit, _ := intParams(c, "limit", "perPage", "per_page", "page_size", "pageSize")
	if limit <= 0 {
		limit = defaultLimit
	} else if limit > 100 {
		limit = maxLimit
	}

	var offset int64 = 0
	var err error
	var p *usecasex.Pagination
	if startCursor := c.QueryParam("start_cursor"); startCursor != "" {
		p = usecasex.CursorPagination{
			First: lo.ToPtr(int64(limit)),
			After: (*usecasex.Cursor)(&startCursor),
		}.Wrap()
	} else {
		if offsets := c.QueryParam("offset"); offsets != "" {
			offset, err = strconv.ParseInt(offsets, 10, 64)
		} else if page := c.QueryParam("page"); page != "" {
			page2, err2 := strconv.ParseInt(page, 10, 64)
			if page2 <= 0 {
				page2 = 1
			}
			offset = (page2 - 1) * limit
			err = err2
		}

		p = usecasex.OffsetPagination{
			Offset: offset,
			Limit:  limit,
		}.Wrap()
	}

	return ListParam{
		Pagination: p,
	}, err
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

func toCSV(c echo.Context, l ListResult[Item], s *schema.Schema) error {
	pr, pw := io.Pipe()

	go func() {
		var err error
		defer func() {
			_ = pw.CloseWithError(err)
		}()

		w := csv.NewWriter(pw)
		keys := lo.Map(s.Fields(), func(f *schema.Field, _ int) string {
			return f.Key().String()
		})
		err = w.Write(append([]string{"id"}, keys...))
		if err != nil {
			log.Errorf("filed to write csv headers, err: %+v", err)
			return
		}

		for _, itm := range l.Results {
			values := []string{itm.ID}
			for _, k := range keys {
				// values = append(values, fmt.Sprintf("%v", itm.Fields[k]))
				var v []byte
				v, err = json.Marshal(itm.Fields[k])
				if err != nil {
					log.Errorf("filed to json marshal field value, err: %+v", err)
					return
				}
				values = append(values, fmt.Sprintf("%v", string(v)))
			}
			err = w.Write(values)
			if err != nil {
				log.Errorf("filed to write csv value, err: %+v", err)
				return
			}
		}
		w.Flush()
	}()

	return c.Stream(http.StatusOK, "text/csv", pr)
}

func extractFirstPointField(itm Item) ([]float64, bool) {
	var coordinates []float64
	for k, v := range itm.Fields {
		if k == "GeometryEditor" || k == "GeometryObject" {
			bs, err := json.Marshal(v)
			if err != nil {
				continue
			}
			geoField := string(bs)
			g, err := integrationapi.StringToGeometry(geoField)
			if err != nil || g == nil {
				continue
			}
			if *g.Type != integrationapi.GeometryTypePoint {
				continue
			}
			coordinates, err = g.Coordinates.AsPoint()
			if err != nil {
				continue
			}
			if len(coordinates) >= 2 {
				return coordinates, true
			}
		}
	}

	return nil, false
}

func toGeoCSV(c echo.Context, l ListResult[Item], s *schema.Schema) error {
	pr, pw := io.Pipe()

	go func() {
		var err error
		defer func() {
			_ = pw.CloseWithError(err)
		}()

		w := csv.NewWriter(pw)
		keys := lo.FilterMap(s.Fields(), func(f *schema.Field, _ int) (string, bool) {
			return f.Key().String(), !integrationapi.IsGeometryField(f)
		})
		err = w.Write(append([]string{"id", "location_lat", "location_lng"}, keys...))
		if err != nil {
			log.Errorf("filed to write csv headers, err: %+v", err)
			return
		}

		for _, itm := range l.Results {
			values := []string{itm.ID}

			coordinates, ok := extractFirstPointField(itm)
			if !ok {
				continue
			}
			lat, lng := integrationapi.Float64ToString(coordinates[0]), integrationapi.Float64ToString(coordinates[1])
			values = append(values, lat, lng)

			for _, k := range keys {
				var v []byte
				v, err = json.Marshal(itm.Fields[k])
				if err != nil {
					log.Errorf("filed to json marshal field value, err: %+v", err)
					return
				}
				if k != "GeometryEditor" && k != "GeometryObject" {
					values = append(values, fmt.Sprintf("%v", string(v)))
				}
			}
			err = w.Write(values)
			if err != nil {
				log.Errorf("filed to write csv value, err: %+v", err)
				return
			}
		}
		w.Flush()
	}()

	return c.Stream(http.StatusOK, "text/csv", pr)
}

func isGeometry(v any) (*integrationapi.Geometry,bool) {
	bs, err := json.Marshal(v)
	if err != nil {
		return nil, false
	}
	geoField := string(bs)
	g, err := integrationapi.StringToGeometry(geoField)
	if err != nil || g == nil {
		return nil, false
	}
	return  g, true
}

func toGeoJSON(c echo.Context, l ListResult[Item], s *schema.Schema) error {
	if !integrationapi.HasGeometryFields(s) {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"error": "no geometry field in this model",
		})
	}

	pr, pw := io.Pipe()

	go func() {
		var err error
		defer func() {
			_ = pw.CloseWithError(err)
		}()

		features := []map[string]interface{}{}

		for _, itm := range l.Results {
			properties := map[string]interface{}{}
			geoFields := []*integrationapi.Geometry{}
			for k, v := range itm.Fields {	
				f, ok := isGeometry(v)
				if ok {
					geoFields = append(geoFields, f)
					continue
				}
				properties[k] = v
			}
			if len(geoFields) == 0 {
				continue
			}
			geometry := geoFields[0]

			feature := map[string]interface{}{
				"type":       "Feature",
				"id":         itm.ID,
				"properties": properties,
				"geometry":   geometry,
			}

			features = append(features, feature)
		}

		if len(features) == 0 {
			return
		}

		featureCollection := map[string]interface{}{
			"type":     "FeatureCollection",
			"features": features,
		}

		err = json.NewEncoder(pw).Encode(featureCollection)
		if err != nil {
			log.Printf("failed to encode GeoJSON, err: %+v", err)
			return
		}
	}()

	return c.Stream(http.StatusOK, "application/json", pr)
}

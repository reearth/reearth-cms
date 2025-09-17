package publicapi

import (
	"encoding/csv"
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

// GeoJSON
func toGeoJSON(c echo.Context, l item.List, sp *schema.Package, assets asset.List) error {
	if !sp.Schema().HasGeometryFields() {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "no geometry field in this model",
		})
	}

	fc, err := exporters.FeatureCollectionFromItems(l, sp, assets)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate GeoJSON").SetInternal(err)
	}

	c.Response().Header().Set(echo.HeaderContentDisposition, "attachment;")
	c.Response().Header().Set(echo.HeaderContentType, "application/json")
	return c.JSON(http.StatusOK, fc)
}

// CSV
func toCSV(c echo.Context, l item.List, s *schema.Schema) error {
	if !s.IsPointFieldSupported() {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "point type is not supported in this model",
		})
	}

	pr, pw := io.Pipe()
	go handleCSVGeneration(pw, l, s)

	c.Response().Header().Set(echo.HeaderContentDisposition, "attachment;")
	c.Response().Header().Set(echo.HeaderContentType, "text/csv")
	return c.Stream(http.StatusOK, "text/csv", pr)
}

func handleCSVGeneration(pw *io.PipeWriter, l item.List, s *schema.Schema) {
	err := generateCSV(pw, l, s)
	if err != nil {
		log.Errorf("failed to generate CSV: %v", err)
		_ = pw.CloseWithError(err)
	} else {
		_ = pw.Close()
	}
}

func generateCSV(pw *io.PipeWriter, l item.List, s *schema.Schema) error {
	w := csv.NewWriter(pw)
	defer w.Flush()

	headers := exporters.BuildCSVHeaders(s)
	if err := w.Write(headers); err != nil {
		return err
	}

	nonGeoFields := lo.Filter(s.Fields(), func(f *schema.Field, _ int) bool {
		return !f.IsGeometryField()
	})

	for _, i := range l {
		row, ok := exporters.RowFromItem(i, nonGeoFields)
		if ok {
			if err := w.Write(row); err != nil {
				return err
			}
		}
	}

	return w.Error()
}

// JSON
func toJSON(c echo.Context, l item.List, sp *schema.Package, aPublic bool, assets asset.List, refItems map[id.ItemID][]Item, pi *usecasex.PageInfo, p *usecasex.Pagination) error {
	items, err := util.TryMap(l, func(i *item.Item) (Item, error) {
		return NewItem(i, sp, assets, refItems[i.ID()]), nil
	})
	if err != nil {
		return err
	}

	res := NewListResult(items, pi, p)
	return c.JSON(http.StatusOK, res)
}

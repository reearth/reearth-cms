package exporters

import (
	"context"
	"encoding/json"
	"fmt"
	"io"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

// JSONExporter handles JSON format exports
type JSONExporter struct {
	isStreaming bool
	itemCount   int
	writer      io.Writer
	schema      *schema.Package
	il          ItemLoader
}

// NewJSONExporter creates a new JSON exporter
func NewJSONExporter(w io.Writer) Exporter {
	return &JSONExporter{
		writer: w,
	}
}

// ValidateRequest validates the export request
func (e *JSONExporter) ValidateRequest(req *ExportRequest) error {
	if e.writer == nil {
		return ErrWriterRequired
	}
	if req.Schema.Schema() == nil {
		return ErrSchemaRequired
	}
	if req.Format != FormatJSON {
		return ErrUnsupportedFormat
	}

	return nil
}

// Export performs the JSON export
func (e *JSONExporter) Export(ctx context.Context, req *ExportRequest, il item.List, al asset.List) error {
	encoder := json.NewEncoder(e.writer)
	encoder.SetIndent("", "  ")
	return e.exportItems(encoder, il, &req.Schema, al)
}

// StartExport initializes the streaming export
func (e *JSONExporter) StartExport(ctx context.Context, req *ExportRequest) error {
	e.isStreaming = true
	e.itemCount = 0
	e.schema = &req.Schema
	e.il = req.ItemLoader

	// Write opening JSON structure
	_, err := e.writer.Write([]byte(`{"results":[`))
	return err
}

// ProcessBatch processes a batch of items for streaming export
func (e *JSONExporter) ProcessBatch(ctx context.Context, items item.List, assets asset.List) error {
	if !e.isStreaming {
		return ErrInvalidRequest
	}

	for i, itm := range items {
		// Add comma if not the first item
		if e.itemCount > 0 || i > 0 {
			if _, err := e.writer.Write([]byte(",")); err != nil {
				return err
			}
		}

		al := func(aids id.AssetIDList) (asset.List, error) {
			return assets.FilterByIDs(aids), nil
		}

		//il := func(iids id.ItemIDList) (item.List, error) {
		//	return items.FilterByIds(iids), nil
		//}

		// Convert item to map and encode
		itemData := MapFromItem(itm, e.schema, al, e.il)
		if itemData != nil {
			encoder := json.NewEncoder(e.writer)
			if err := encoder.Encode(itemData); err != nil {
				return err
			}
			e.itemCount++
		}
	}

	return nil
}

// EndExport finalizes the streaming export
func (e *JSONExporter) EndExport(ctx context.Context, extra map[string]any) error {
	if !e.isStreaming {
		return ErrInvalidRequest
	}

	// close results array
	_, err := e.writer.Write([]byte(`]`))
	if err != nil {
		return err
	}

	if len(extra) > 0 {
		// add comma if there are extra properties
		_, err = e.writer.Write([]byte(`,`))
		if err != nil {
			return err
		}
	}

	err = e.appendProps(extra)
	if err != nil {
		return err
	}

	// close root object
	_, err = e.writer.Write([]byte(`}`))

	e.isStreaming = false
	return err
}

func (e *JSONExporter) appendProps(props map[string]any) error {
	i := 0
	for key, value := range props {
		// Marshal the value
		valueBytes, err := json.Marshal(value)
		if err != nil {
			return err
		}

		// Write key-value pair
		if i > 0 {
			if _, err := e.writer.Write([]byte(",")); err != nil {
				return err
			}
		}

		entry := fmt.Sprintf(`"%s":%s`, key, valueBytes)
		if _, err := e.writer.Write([]byte(entry)); err != nil {
			return err
		}
		i++
	}

	return nil
}

func (e *JSONExporter) exportItems(encoder *json.Encoder, items item.List, sp *schema.Package, assets asset.List) error {
	itemsMap := make([]map[string]any, 0, len(items))

	al := func(aids id.AssetIDList) (asset.List, error) {
		return assets.FilterByIDs(aids), nil
	}

	il := func(iids id.ItemIDList) (item.List, error) {
		return items.FilterByIds(iids), nil
	}

	for _, itm := range items {
		itemData := MapFromItem(itm, sp, al, il)
		if itemData != nil {
			itemsMap = append(itemsMap, itemData)
		}
	}

	return encoder.Encode(map[string]any{
		"items": itemsMap,
		"total": len(itemsMap),
	})
}

package exporters

import (
	"context"
	"encoding/json"
	"io"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

// GeoJSONExporter handles GeoJSON format exports
type GeoJSONExporter struct {
	isStreaming  bool
	featureCount int
	writer       io.Writer
	schema       *schema.Package
}

// NewGeoJSONExporter creates a new GeoJSON exporter
func NewGeoJSONExporter(w io.Writer) Exporter {
	return &GeoJSONExporter{
		writer: w,
	}
}

// ValidateRequest validates the export request
func (e *GeoJSONExporter) ValidateRequest(req *ExportRequest) error {
	if e.writer == nil {
		return ErrWriterRequired
	}

	if req.Schema.Schema() == nil {
		return ErrSchemaRequired
	}

	if !req.Schema.Schema().HasGeometryFields() {
		return ErrNoGeometryField
	}

	return nil
}

// Export performs the GeoJSON export
func (e *GeoJSONExporter) Export(ctx context.Context, req *ExportRequest, il item.List, al asset.List) error {
	fc, err := FeatureCollectionFromItems(il, e.schema, al)
	if err != nil {
		return err
	}

	encoder := json.NewEncoder(e.writer)
	encoder.SetIndent("", "  ")

	return encoder.Encode(fc)
}

// StartExport initializes the streaming GeoJSON export
func (e *GeoJSONExporter) StartExport(ctx context.Context, req *ExportRequest) error {
	e.isStreaming = true
	e.featureCount = 0
	e.schema = &req.Schema

	// Write opening GeoJSON FeatureCollection structure
	_, err := e.writer.Write([]byte(`{"type":"FeatureCollection","features":[`))
	return err
}

// ProcessBatch processes a batch of items for streaming GeoJSON export
func (e *GeoJSONExporter) ProcessBatch(ctx context.Context, items item.List, assets asset.List) error {
	if !e.isStreaming {
		return ErrInvalidRequest
	}

	for _, itm := range items {
		feature, ok := featureFromItem(itm, e.schema, assets)
		if !ok {
			continue
		}

		// Add comma if not the first feature
		if e.featureCount > 0 {
			if _, err := e.writer.Write([]byte(",")); err != nil {
				return err
			}
		}

		// Encode the feature
		encoder := json.NewEncoder(e.writer)
		if err := encoder.Encode(feature); err != nil {
			return err
		}

		e.featureCount++
	}

	return nil
}

// EndExport finalizes the streaming GeoJSON export
func (e *GeoJSONExporter) EndExport(ctx context.Context, extra map[string]any) error {
	if !e.isStreaming {
		return ErrInvalidRequest
	}

	// Close GeoJSON structure
	_, err := e.writer.Write([]byte(`]}`))

	e.isStreaming = false
	return err
}

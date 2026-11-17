package internalapimodel

import (
	"testing"

	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestToSchemaFieldType(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		t    value.Type
		want pb.SchemaField_Type
	}{
		{name: "text", t: value.TypeText, want: pb.SchemaField_Text},
		{name: "geometry object", t: value.TypeGeometryObject, want: pb.SchemaField_GeometryObject},
		{name: "geometry editor", t: value.TypeGeometryEditor, want: pb.SchemaField_GeometryEditor},
		{name: "geometry", t: value.TypeGeometry, want: pb.SchemaField_Geometry},
		{name: "unknown", t: value.Type("unknown"), want: pb.SchemaField_Text},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, ToSchemaFieldType(tt.t))
		})
	}
}

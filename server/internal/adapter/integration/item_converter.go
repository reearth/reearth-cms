package integration

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
)

func toItemFieldParam(f integrationapi.Field) interfaces.ItemFieldParam {
	return interfaces.ItemFieldParam{
		SchemaFieldID: *f.Id,
		ValueType:     integrationapi.FromSchemaFieldType(f.Type),
		Value:         f.Value,
	}
}

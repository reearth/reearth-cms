package item

import (
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type Field struct {
	schemaFieldID schema.FieldID
	value         *value.Value
}

func NewField(schemaFieldID schema.FieldID, value *value.Value) *Field {
	return &Field{schemaFieldID: schemaFieldID, value: value}
}

func (f *Field) SchemaFieldID() schema.FieldID {
	return f.schemaFieldID
}

func (f *Field) Value() *value.Value {
	return f.value
}

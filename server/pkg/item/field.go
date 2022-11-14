package item

import "github.com/reearth/reearth-cms/server/pkg/schema"

type Field struct {
	schemaFieldID schema.FieldID
	valueType     schema.Type
	value         any
}

func NewField(schemaFieldID schema.FieldID, valueType schema.Type, value any) *Field {
	return &Field{schemaFieldID: schemaFieldID, valueType: valueType, value: value}
}

func (f *Field) SchemaFieldID() schema.FieldID {
	return f.schemaFieldID
}

func (f *Field) ValueType() schema.Type {
	return f.valueType
}

func (f *Field) Value() any {
	return f.value
}

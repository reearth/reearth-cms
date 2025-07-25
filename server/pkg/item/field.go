package item

import (
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/util"
)

type Field struct {
	field FieldID
	group *ItemGroupID
	value *value.Multiple
}

func NewField(field FieldID, v *value.Multiple, ig *ItemGroupID) *Field {
	if v == nil {
		return nil
	}
	return &Field{
		field: field,
		value: v,
		group: ig,
	}
}

func (f *Field) FieldID() schema.FieldID {
	return f.field
}

func (f *Field) Type() value.Type {
	return f.value.Type()
}

func (f *Field) Value() *value.Multiple {
	if f == nil {
		return nil
	}
	return f.value
}

func (f *Field) ItemGroup() *ItemGroupID {
	if f == nil {
		return nil
	}
	return util.CloneRef(f.group)
}

func (f *Field) IsGeometryField() bool {
	return f.Type() == value.TypeGeometryObject || f.Type() == value.TypeGeometryEditor
}

func (f *Field) Clone() *Field {
	if f == nil {
		return nil
	}
	return &Field{
		field: f.field,
		value: f.value.Clone(),
		group: util.CloneRef(f.group),
	}
}

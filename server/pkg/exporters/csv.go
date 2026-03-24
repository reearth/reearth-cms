package exporters

import (
	"strconv"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

func CSVFromItems(l item.List, sp *schema.Package) ([][]string, error) {
	header := BuildCSVHeaders(sp)
	data := lo.Map(l, func(itm *item.Item, _ int) []string {
		row, ok := RowFromItem(itm, sp)
		if !ok {
			return nil
		}
		return row
	})
	rows := [][]string{header}

	return append(rows, data...), nil
}

func BuildCSVHeaders(sp *schema.Package) []string {
	sfl := supportedFields(sp)
	keys := lo.Map(sfl, func(f *schema.Field, _ int) string {
		return f.Key().String()
	})

	return append([]string{"id"}, keys...)
}

func RowFromItem(itm *item.Item, sp *schema.Package) ([]string, bool) {
	sfl := supportedFields(sp)
	primitiveValues := lo.Map(sfl, func(sf *schema.Field, _ int) string {
		f := itm.Field(sf.ID())
		return toCSVProp(f)
	})
	row := []string{itm.ID().String()}

	return append(row, primitiveValues...), true
}

func csvSupportedFieldTypes() []value.Type {
	return []value.Type{
		value.TypeText,
		value.TypeTextArea,
		value.TypeRichText,
		value.TypeMarkdown,
		value.TypeSelect,
		value.TypeTag,
		value.TypeURL,
		value.TypeInteger,
		value.TypeNumber,
		value.TypeBool,
		value.TypeCheckbox,
		value.TypeDateTime,
	}
}

func isFieldSupported(f *schema.Field) bool {
	if f == nil {
		return false
	}
	return lo.Contains(csvSupportedFieldTypes(), f.Type()) && !f.Multiple()
}

func supportedFields(sp *schema.Package) schema.FieldList {
	if sp == nil || sp.Schema() == nil {
		return nil
	}
	return lo.Filter(sp.Schema().Fields(), func(f *schema.Field, _ int) bool {
		return isFieldSupported(f)
	})
}

func toCSVProp(f *item.Field) string {
	if f == nil {
		return ""
	}
	vv := f.Value().First()
	return toCSVValue(vv)
}

func toCSVValue(vv *value.Value) string {
	if vv == nil {
		return ""
	}

	switch vv.Type() {
	case value.TypeText, value.TypeTextArea, value.TypeRichText, value.TypeMarkdown, value.TypeSelect, value.TypeTag:
		v, ok := vv.ValueString()
		if !ok {
			return ""
		}
		return v
	case value.TypeURL:
		v, ok := vv.ValueURL()
		if !ok {
			return ""
		}
		return v.String()
	case value.TypeInteger:
		v, ok := vv.ValueInteger()
		if !ok {
			return ""
		}
		return strconv.FormatInt(v, 10)
	case value.TypeNumber:
		v, ok := vv.ValueNumber()
		if !ok {
			return ""
		}
		return strconv.FormatFloat(v, 'f', -1, 64)
	case value.TypeBool, value.TypeCheckbox:
		v, ok := vv.ValueBool()
		if !ok {
			return ""
		}
		return strconv.FormatBool(v)
	case value.TypeDateTime:
		v, ok := vv.ValueDateTime()
		if !ok {
			return ""
		}
		return v.Format(time.RFC3339)
	default:
		return ""
	}
}

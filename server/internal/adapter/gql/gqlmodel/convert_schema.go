package gqlmodel

import (
	"reflect"
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func ToSchema(s *schema.Schema) *Schema {
	if s == nil {
		return nil
	}

	return &Schema{
		ID:        IDFrom(s.ID()),
		ProjectID: IDFrom(s.Project()),
		Fields: lo.Map(s.Fields(), func(sf *schema.Field, _ int) *SchemaField {
			return ToSchemaField(sf, s.TitleField())
		}),
		TitleFieldID: IDFromRef(s.TitleField()),
	}
}

func ToSchemaField(sf *schema.Field, titleField *id.FieldID) *SchemaField {
	if sf == nil {
		return nil
	}

	return &SchemaField{
		ID:           IDFrom(sf.ID()),
		Type:         ToValueType(sf.Type()),
		TypeProperty: ToSchemaFieldTypeProperty(sf.TypeProperty(), sf.DefaultValue(), sf.Multiple()),
		Key:          sf.Key().String(),
		Title:        sf.Name(),
		Order:        lo.ToPtr(sf.Order()),
		Description:  lo.ToPtr(sf.Description()),
		Multiple:     sf.Multiple(),
		Unique:       sf.Unique(),
		Required:     sf.Required(),
		IsTitle:      lo.FromPtr(titleField) == sf.ID(),
		CreatedAt:    sf.CreatedAt(),
		UpdatedAt:    sf.UpdatedAt(),
	}
}

func ToSchemaFieldTagColor(c schema.TagColor) SchemaFieldTagColor {
	switch c {
	case schema.TagColorMagenta:
		return SchemaFieldTagColorMagenta
	case schema.TagColorRed:
		return SchemaFieldTagColorRed
	case schema.TagColorVolcano:
		return SchemaFieldTagColorVolcano
	case schema.TagColorOrange:
		return SchemaFieldTagColorOrange
	case schema.TagColorGreen:
		return SchemaFieldTagColorGreen
	case schema.TagColorGold:
		return SchemaFieldTagColorGold
	case schema.TagColorLime:
		return SchemaFieldTagColorLime
	case schema.TagColorCyan:
		return SchemaFieldTagColorCyan
	case schema.TagColorBlue:
		return SchemaFieldTagColorBlue
	case schema.TagColorGeekblue:
		return SchemaFieldTagColorGeekblue
	case schema.TagColorPurple:
		return SchemaFieldTagColorPurple

	default:
		return ""
	}

}

func ToGeometryObjectSupportedType(g schema.GeometryObjectSupportedType) GeometryObjectSupportedType {
	switch g {
	case schema.GeometryObjectSupportedTypePoint:
		return GeometryObjectSupportedTypePoint
	case schema.GeometryObjectSupportedTypeMultiPoint:
		return GeometryObjectSupportedTypeMultipoint
	case schema.GeometryObjectSupportedTypeLineString:
		return GeometryObjectSupportedTypeLinestring
	case schema.GeometryObjectSupportedTypeMultiLineString:
		return GeometryObjectSupportedTypeMultilinestring
	case schema.GeometryObjectSupportedTypePolygon:
		return GeometryObjectSupportedTypePolygon
	case schema.GeometryObjectSupportedTypeMultiPolygon:
		return GeometryObjectSupportedTypeMultipolygon
	case schema.GeometryObjectSupportedTypeGeometryCollection:
		return GeometryObjectSupportedTypeGeometrycollection

	default:
		return ""
	}
}

func FromGeometryObjectSupportedType(g GeometryObjectSupportedType) schema.GeometryObjectSupportedType {
	switch g {
	case GeometryObjectSupportedTypePoint:
		return schema.GeometryObjectSupportedTypePoint
	case GeometryObjectSupportedTypeMultipoint:
		return schema.GeometryObjectSupportedTypeMultiPoint
	case GeometryObjectSupportedTypeLinestring:
		return schema.GeometryObjectSupportedTypeLineString
	case GeometryObjectSupportedTypeMultilinestring:
		return schema.GeometryObjectSupportedTypeMultiLineString
	case GeometryObjectSupportedTypePolygon:
		return schema.GeometryObjectSupportedTypePolygon
	case GeometryObjectSupportedTypeMultipolygon:
		return schema.GeometryObjectSupportedTypeMultiPolygon
	case GeometryObjectSupportedTypeGeometrycollection:
		return schema.GeometryObjectSupportedTypeGeometryCollection

	default:
		return ""
	}
}

func ToGeometryEditorSupportedType(g schema.GeometryEditorSupportedType) GeometryEditorSupportedType {
	switch g {
	case schema.GeometryEditorSupportedTypePoint:
		return GeometryEditorSupportedTypePoint
	case schema.GeometryEditorSupportedTypeLineString:
		return GeometryEditorSupportedTypeLinestring
	case schema.GeometryEditorSupportedTypePolygon:
		return GeometryEditorSupportedTypePolygon
	case schema.GeometryEditorSupportedTypeAny:
		return GeometryEditorSupportedTypeAny

	default:
		return ""
	}
}

func FromGeometryEditorSupportedType(g GeometryEditorSupportedType) schema.GeometryEditorSupportedType {
	switch g {
	case GeometryEditorSupportedTypePoint:
		return schema.GeometryEditorSupportedTypePoint
	case GeometryEditorSupportedTypeLinestring:
		return schema.GeometryEditorSupportedTypeLineString
	case GeometryEditorSupportedTypePolygon:
		return schema.GeometryEditorSupportedTypePolygon
	case GeometryEditorSupportedTypeAny:
		return schema.GeometryEditorSupportedTypeAny

	default:
		return ""
	}
}

func ToSchemaFieldTypeProperty(tp *schema.TypeProperty, dv *value.Multiple, multiple bool) (res SchemaFieldTypeProperty) {
	tp.Match(schema.TypePropertyMatch{
		Text: func(f *schema.FieldText) {
			res = &SchemaFieldText{
				DefaultValue: valueString(dv, multiple),
				MaxLength:    f.MaxLength(),
			}
		},
		TextArea: func(f *schema.FieldTextArea) {
			res = &SchemaFieldTextArea{
				DefaultValue: valueString(dv, multiple),
				MaxLength:    f.MaxLength(),
			}
		},
		RichText: func(f *schema.FieldRichText) {
			res = &SchemaFieldRichText{
				DefaultValue: valueString(dv, multiple),
				MaxLength:    f.MaxLength(),
			}
		},
		Markdown: func(f *schema.FieldMarkdown) {
			res = &SchemaFieldMarkdown{
				DefaultValue: valueString(dv, multiple),
				MaxLength:    f.MaxLength(),
			}
		},
		Select: func(f *schema.FieldSelect) {
			res = &SchemaFieldSelect{
				DefaultValue: valueString(dv, multiple),
				Values:       f.Values(),
			}
		},
		Group: func(f *schema.FieldGroup) {
			res = &SchemaFieldGroup{
				GroupID: IDFrom(f.Group()),
			}
		},
		Tag: func(f *schema.FieldTag) {
			tags := lo.Map(f.Tags(), func(tag *schema.Tag, _ int) *SchemaFieldTagValue {
				return &SchemaFieldTagValue{
					ID:    IDFrom(tag.ID()),
					Name:  tag.Name(),
					Color: ToSchemaFieldTagColor(tag.Color()),
				}
			})
			res = &SchemaFieldTag{
				DefaultValue: valueString(dv, multiple),
				Tags:         tags,
			}
		},
		Asset: func(f *schema.FieldAsset) {
			var v any = nil
			if dv != nil {
				if multiple {
					v, _ = dv.ValuesAsset()
				} else {
					v, _ = dv.First().ValueAsset()
				}
			}
			res = &SchemaFieldAsset{
				DefaultValue: v,
			}
		},
		DateTime: func(f *schema.FieldDateTime) {
			var v any = nil
			if dv != nil {
				if multiple {
					v, _ = dv.ValuesDateTime()
				} else {
					v, _ = dv.First().ValueDateTime()
				}
			}
			res = &SchemaFieldDate{
				DefaultValue: v,
			}
		},
		Bool: func(f *schema.FieldBool) {
			var v any = nil
			if dv != nil {
				if multiple {
					v, _ = dv.ValuesBool()
				} else {
					v, _ = dv.First().ValueBool()
				}
			}
			res = &SchemaFieldBool{
				DefaultValue: v,
			}
		},
		Checkbox: func(f *schema.FieldCheckbox) {
			var v any = nil
			if dv != nil {
				if multiple {
					v, _ = dv.ValuesBool()
				} else {
					v, _ = dv.First().ValueBool()
				}
			}
			res = &SchemaFieldCheckbox{
				DefaultValue: v,
			}
		},
		Number: func(f *schema.FieldNumber) {
			var v any = nil
			if dv != nil {
				if multiple {
					v, _ = dv.ValuesNumber()
				} else {
					v, _ = dv.First().ValueNumber()
				}
			}
			res = &SchemaFieldNumber{
				DefaultValue: v,
				Min:          f.Min(),
				Max:          f.Max(),
			}
		},
		Integer: func(f *schema.FieldInteger) {
			var v any = nil
			if dv != nil {
				if multiple {
					v, _ = dv.ValuesInteger()
				} else {
					v, _ = dv.First().ValueInteger()
				}
			}
			res = &SchemaFieldInteger{
				DefaultValue: v,
				Min:          intPtr(f.Min()),
				Max:          intPtr(f.Max()),
			}
		},
		Reference: func(f *schema.FieldReference) {
			res = &SchemaFieldReference{
				ModelID:              IDFrom(f.Model()),
				SchemaID:             IDFrom(f.Schema()),
				CorrespondingFieldID: IDFromRef(f.CorrespondingFieldID()),
			}
		},
		URL: func(f *schema.FieldURL) {
			var v any = nil
			if dv != nil {
				if multiple {
					urls, _ := dv.ValuesURL()
					v = lo.Map(urls, func(v value.URL, _ int) string { return v.String() })
				} else {
					url, _ := dv.First().ValueURL()
					v = url.String()
				}
			}
			res = &SchemaFieldURL{
				DefaultValue: v,
			}
		},
		GeometryObject: func(f *schema.FieldGeometryObject) {
			var v any = nil
			if dv != nil {
				if multiple {
					v, _ = dv.ValuesString()
				} else {
					v, _ = dv.First().ValueString()
				}
			}
			res = &SchemaFieldGeometryObject{
				DefaultValue: v,
				SupportedTypes: lo.Map(f.SupportedTypes(), func(v schema.GeometryObjectSupportedType, _ int) GeometryObjectSupportedType {
					return ToGeometryObjectSupportedType(v)
				}),
			}
		},
		GeometryEditor: func(f *schema.FieldGeometryEditor) {
			var v any = nil
			if dv != nil {
				if multiple {
					v, _ = dv.ValuesString()
				} else {
					v, _ = dv.First().ValueString()
				}
			}
			res = &SchemaFieldGeometryEditor{
				DefaultValue: v,
				SupportedTypes: lo.Map(f.SupportedTypes(), func(v schema.GeometryEditorSupportedType, _ int) GeometryEditorSupportedType {
					return ToGeometryEditorSupportedType(v)
				}),
			}
		},
	})
	return
}

func valueString(dv *value.Multiple, multiple bool) any {
	if dv == nil {
		return nil
	}
	var v any
	if multiple {
		v, _ = dv.ValuesString()
	} else {
		v, _ = dv.First().ValueString()
	}
	return v
}

var ErrInvalidTypeProperty = rerror.NewE(i18n.T("invalid type property"))
var ErrMultipleReference = rerror.NewE(i18n.T("multiple reference is not supported"))
var ErrEmptyOptions = rerror.NewE(i18n.T("Options could not be empty!"))

func FromCorrespondingField(cf *CorrespondingFieldInput) *schema.CorrespondingField {
	if cf == nil {
		return nil
	}

	return &schema.CorrespondingField{
		Title:       cf.Title,
		Key:         cf.Key,
		Description: cf.Description,
		Required:    cf.Required,
	}
}

func FromSchemaTypeProperty(tp *SchemaFieldTypePropertyInput, t SchemaFieldType, multiple bool) (tpRes *schema.TypeProperty, dv *value.Multiple, err error) {
	if tp == nil {
		return nil, nil, nil
	}
	switch t {
	case SchemaFieldTypeText:
		x := tp.Text
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeText, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeText, x.DefaultValue).AsMultiple()
		}
		tpRes = schema.NewText(x.MaxLength).TypeProperty()
	case SchemaFieldTypeTextArea:
		x := tp.TextArea
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeTextArea, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeTextArea, x.DefaultValue).AsMultiple()
		}
		tpRes = schema.NewTextArea(x.MaxLength).TypeProperty()
	case SchemaFieldTypeRichText:
		x := tp.RichText
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeRichText, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeRichText, x.DefaultValue).AsMultiple()
		}
		tpRes = schema.NewRichText(x.MaxLength).TypeProperty()
	case SchemaFieldTypeMarkdownText:
		x := tp.MarkdownText
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeMarkdown, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeMarkdownText, x.DefaultValue).AsMultiple()
		}
		tpRes = schema.NewMarkdown(x.MaxLength).TypeProperty()
	case SchemaFieldTypeAsset:
		x := tp.Asset
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeAsset, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeAsset, x.DefaultValue).AsMultiple()
		}
		tpRes = schema.NewAsset().TypeProperty()
	case SchemaFieldTypeDate:
		x := tp.Date
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeDateTime, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeDate, x.DefaultValue).AsMultiple()
		}
		tpRes = schema.NewDateTime().TypeProperty()
	case SchemaFieldTypeBool:
		x := tp.Bool
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeBool, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeBool, x.DefaultValue).AsMultiple()
		}
		tpRes = schema.NewBool().TypeProperty()
	case SchemaFieldTypeCheckbox:
		x := tp.Checkbox
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeCheckbox, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeCheckbox, x.DefaultValue).AsMultiple()
		}
		tpRes = schema.NewCheckbox().TypeProperty()
	case SchemaFieldTypeSelect:
		x := tp.Select
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		res := schema.NewSelect(x.Values)
		if len(res.Values()) == 0 {
			return nil, nil, ErrEmptyOptions
		}
		if multiple {
			dv = value.NewMultiple(value.TypeSelect, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeSelect, x.DefaultValue).AsMultiple()
		}
		tpRes = res.TypeProperty()
	case SchemaFieldTypeTag:
		x := tp.Tag
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		var tags schema.TagList
		for _, t := range x.Tags {
			var tag *schema.Tag
			if t.ID == nil {
				tag = schema.NewTag(*t.Name, schema.TagColorFrom(t.Color.String()))
			} else {
				tid, err := ToID[id.Tag](*t.ID)
				if err != nil {
					return nil, nil, err
				}
				tag, err = schema.NewTagWithID(tid, *t.Name, schema.TagColorFrom(t.Color.String()))
				if err != nil {
					return nil, nil, err
				}
			}
			tags = append(tags, tag)
		}
		if len(tags) == 0 {
			return nil, nil, ErrEmptyOptions
		}
		res, err := schema.NewFieldTag(tags)
		if err != nil {
			return nil, nil, err
		}

		if multiple {
			values := unpackArray(x.DefaultValue)
			valuesNames := lo.Map(values, func(v any, _ int) string {
				return v.(string)
			})
			tagsIds := lo.Map(valuesNames, func(n string, _ int) any {
				return tags.FindByName(n).ID().String()
			})
			dv = value.NewMultiple(value.TypeTag, tagsIds)
		} else {
			valueName, _ := x.DefaultValue.(string)
			tag := tags.FindByName(valueName)
			tagId := ""
			if tag != nil {
				tagId = tag.ID().String()
			}
			dv = FromValue(SchemaFieldTypeTag, tagId).AsMultiple()
		}
		tpRes = res.TypeProperty()
	case SchemaFieldTypeInteger:
		x := tp.Integer
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeInteger, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeInteger, x.DefaultValue).AsMultiple()
		}
		var min, max *int64
		if x.Min != nil {
			min = lo.ToPtr(int64(*x.Min))
		}
		if x.Max != nil {
			max = lo.ToPtr(int64(*x.Max))
		}
		tpi, err2 := schema.NewInteger(min, max)
		if err2 != nil {
			err = err2
		}
		tpRes = tpi.TypeProperty()
	case SchemaFieldTypeNumber:
		x := tp.Number
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeNumber, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeNumber, x.DefaultValue).AsMultiple()
		}
		var min, max *float64
		if x.Min != nil {
			min = lo.ToPtr(float64(*x.Min))
		}
		if x.Max != nil {
			max = lo.ToPtr(float64(*x.Max))
		}
		tpi, err2 := schema.NewNumber(min, max)
		if err2 != nil {
			err = err2
		}
		tpRes = tpi.TypeProperty()
	case SchemaFieldTypeReference:
		x := tp.Reference
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			return nil, nil, ErrMultipleReference
		}
		mId, err := ToID[id.Model](x.ModelID)
		if err != nil {
			return nil, nil, err
		}
		sId, err := ToID[id.Schema](x.SchemaID)
		if err != nil {
			return nil, nil, err
		}
		var fid *id.FieldID
		if x.CorrespondingField != nil {
			fid = ToIDRef[id.Field](x.CorrespondingField.FieldID)
		}
		tpRes = schema.NewReference(mId, sId, fid, FromCorrespondingField(x.CorrespondingField)).TypeProperty()
	case SchemaFieldTypeGroup:
		x := tp.Group
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		gid, err := ToID[id.Group](x.GroupID)
		if err != nil {
			return nil, nil, err
		}

		tpRes = schema.NewGroup(gid).TypeProperty()
	case SchemaFieldTypeURL:
		x := tp.URL
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeURL, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeURL, x.DefaultValue).AsMultiple()
		}
		tpRes = schema.NewURL().TypeProperty()
	case SchemaFieldTypeGeometryObject:
		x := tp.GeometryObject
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeGeometryObject, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeGeometryObject, x.DefaultValue).AsMultiple()
		}
		tpRes = schema.NewGeometryObject(lo.Map(x.SupportedTypes, func(v GeometryObjectSupportedType, _ int) schema.GeometryObjectSupportedType {
			return FromGeometryObjectSupportedType(v)
		})).TypeProperty()
	case SchemaFieldTypeGeometryEditor:
		x := tp.GeometryEditor
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		if multiple {
			dv = value.NewMultiple(value.TypeGeometryEditor, unpackArray(x.DefaultValue))
		} else {
			dv = FromValue(SchemaFieldTypeGeometryEditor, x.DefaultValue).AsMultiple()
		}
		tpRes = schema.NewGeometryEditor(lo.Map(x.SupportedTypes, func(v GeometryEditorSupportedType, _ int) schema.GeometryEditorSupportedType {
			return FromGeometryEditorSupportedType(v)
		})).TypeProperty()
	default:
		return nil, nil, ErrInvalidTypeProperty
	}
	return
}

// TODO: move to util
func unpackArray(s any) []any {
	if s == nil {
		return nil
	}
	v := reflect.ValueOf(s)
	if v.Kind() != reflect.Slice {
		return nil
	}
	r := make([]any, v.Len())
	for i := 0; i < v.Len(); i++ {
		elem := v.Index(i).Interface()
		if str, ok := elem.(string); ok && strings.TrimSpace(str) == "" {
			r[i] = nil
		} else {
			r[i] = elem
		}
	}
	return r
}

func intPtr(v *int64) *int {
	if v == nil {
		return nil
	}
	return lo.ToPtr((int)(*v))
}

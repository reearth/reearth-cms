package gqlmodel

import (
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/util"
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
			return ToSchemaField(sf)
		}),
	}
}

func ToSchemaField(sf *schema.Field) *SchemaField {
	if sf == nil {
		return nil
	}

	return &SchemaField{
		ID:           IDFrom(sf.ID()),
		Type:         ToValueType(sf.Type()),
		TypeProperty: ToSchemaFieldTypeProperty(sf.TypeProperty(), sf.DefaultValue()),
		Key:          sf.Key().String(),
		Title:        sf.Name(),
		Description:  lo.ToPtr(sf.Description()),
		MultiValue:   sf.Multiple(),
		Unique:       sf.Unique(),
		Required:     sf.Required(),
		CreatedAt:    sf.CreatedAt(),
		UpdatedAt:    sf.UpdatedAt(),
	}
}

func ToSchemaFieldTypeProperty(tp *schema.TypeProperty, dv *value.Value) (res SchemaFieldTypeProperty) {
	tp.Match(schema.TypePropertyMatch{
		Text: func(f *schema.FieldText) {
			v, _ := dv.ValueString()
			res = &SchemaFieldText{
				DefaultValue: util.ToPtrIfNotEmpty(v),
				MaxLength:    f.MaxLength(),
			}
		},
		TextArea: func(f *schema.FieldTextArea) {
			v, _ := dv.ValueString()
			res = &SchemaFieldTextArea{
				DefaultValue: util.ToPtrIfNotEmpty(v),
				MaxLength:    f.MaxLength(),
			}
		},
		RichText: func(f *schema.FieldRichText) {
			v, _ := dv.ValueString()
			res = &SchemaFieldRichText{
				DefaultValue: util.ToPtrIfNotEmpty(v),
				MaxLength:    f.MaxLength(),
			}
		},
		Markdown: func(f *schema.FieldMarkdown) {
			v, _ := dv.ValueString()
			res = &SchemaFieldMarkdown{
				DefaultValue: util.ToPtrIfNotEmpty(v),
				MaxLength:    f.MaxLength(),
			}
		},
		Asset: func(f *schema.FieldAsset) {
			v, _ := dv.ValueAsset()
			res = &SchemaFieldAsset{
				DefaultValue: IDFromRef(util.ToPtrIfNotEmpty(v)),
			}
		},
		DateTime: func(f *schema.FieldDateTime) {
			v, _ := dv.ValueDateTime()
			res = &SchemaFieldDate{
				DefaultValue: util.ToPtrIfNotEmpty(v),
			}
		},
		Bool: func(f *schema.FieldBool) {
			v, _ := dv.ValueBool()
			res = &SchemaFieldBool{
				DefaultValue: util.ToPtrIfNotEmpty(v),
			}
		},
		Select: func(f *schema.FieldSelect) {
			v, _ := dv.ValueString()
			res = &SchemaFieldSelect{
				DefaultValue: util.ToPtrIfNotEmpty(v),
				Values:       f.Values(),
			}
		},
		Number: func(f *schema.FieldNumber) {
			v, _ := dv.ValueNumber()
			// res = &SchemaFieldNumber{
			res = &SchemaFieldInteger{
				DefaultValue: util.ToPtrIfNotEmpty(int(v)),
				Min:          util.ToPtrIfNotEmpty(int(lo.FromPtr(f.Min()))),
				Max:          util.ToPtrIfNotEmpty(int(lo.FromPtr(f.Max()))),
			}
		},
		Integer: func(f *schema.FieldInteger) {
			v, _ := dv.ValueInteger()
			res = &SchemaFieldInteger{
				DefaultValue: util.ToPtrIfNotEmpty(int(v)),
				Min:          util.ToPtrIfNotEmpty(int(lo.FromPtr(f.Min()))),
				Max:          util.ToPtrIfNotEmpty(int(lo.FromPtr(f.Max()))),
			}
		},
		Reference: func(f *schema.FieldReference) {
			res = &SchemaFieldReference{
				ModelID: IDFrom(f.Model()),
			}
		},
		URL: func(f *schema.FieldURL) {
			v, _ := dv.ValueURL()
			res = &SchemaFieldURL{
				DefaultValue: util.ToPtrIfNotEmpty(lo.ToPtr(lo.FromPtr(v)).String()),
			}
		},
	})
	return
}

var ErrInvalidTypeProperty = errors.New("invalid type property")

func FromSchemaTypeProperty(tp *SchemaFieldTypePropertyInput, t SchemaFiledType) (tpRes *schema.TypeProperty, dv *value.Value, err error) {
	switch t {
	case SchemaFiledTypeText:
		x := tp.Text
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		dv = FromValue(SchemaFiledTypeText, x.DefaultValue)
		tpRes = schema.NewText(x.MaxLength).TypeProperty()
	case SchemaFiledTypeTextArea:
		x := tp.TextArea
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		dv = FromValue(SchemaFiledTypeTextArea, x.DefaultValue)
		tpRes = schema.NewTextArea(x.MaxLength).TypeProperty()
	case SchemaFiledTypeRichText:
		x := tp.RichText
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		dv = FromValue(SchemaFiledTypeRichText, x.DefaultValue)
		tpRes = schema.NewRichText(x.MaxLength).TypeProperty()
	case SchemaFiledTypeMarkdownText:
		x := tp.MarkdownText
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		dv = FromValue(SchemaFiledTypeMarkdownText, x.DefaultValue)
		tpRes = schema.NewMarkdown(x.MaxLength).TypeProperty()
	case SchemaFiledTypeAsset:
		x := tp.Asset
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		dv = FromValue(SchemaFiledTypeAsset, x.DefaultValue)
		tpRes = schema.NewAsset().TypeProperty()
	case SchemaFiledTypeDate:
		x := tp.Date
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		dv = FromValue(SchemaFiledTypeDate, x.DefaultValue)
		tpRes = schema.NewDateTime().TypeProperty()
	case SchemaFiledTypeBool:
		x := tp.Bool
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		dv = FromValue(SchemaFiledTypeBool, x.DefaultValue)
		tpRes = schema.NewBool().TypeProperty()
	case SchemaFiledTypeSelect:
		x := tp.Select
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		dv = FromValue(SchemaFiledTypeSelect, x.DefaultValue)
		tpRes = schema.NewSelect(x.Values).TypeProperty()
	case SchemaFiledTypeInteger:
		x := tp.Integer
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		dv = FromValue(SchemaFiledTypeInteger, x.DefaultValue)
		var min, max *int64
		if x.Min != nil {
			min = lo.ToPtr(int64(*min))
		}
		if x.Max != nil {
			min = lo.ToPtr(int64(*max))
		}
		tpi, err2 := schema.NewInteger(min, max)
		if err2 != nil {
			err = err2
		}
		tpRes = tpi.TypeProperty()
	case SchemaFiledTypeReference:
		x := tp.Reference
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		mId, err := ToID[id.Model](x.ModelID)
		if err != nil {
			return nil, nil, err
		}
		tpRes = schema.NewReference(mId).TypeProperty()
	case SchemaFiledTypeURL:
		x := tp.URL
		if x == nil {
			return nil, nil, ErrInvalidTypeProperty
		}
		dv = FromValue(SchemaFiledTypeURL, x.DefaultValue)
		tpRes = schema.NewURL().TypeProperty()
	default:
		return nil, nil, ErrInvalidTypeProperty
	}
	return
}

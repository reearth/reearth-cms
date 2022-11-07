package gqlmodel

import (
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
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
		TypeProperty: ToSchemaFieldTypeProperty(sf.TypeProperty()),
		Key:          sf.Key().String(),
		Title:        sf.Name(),
		Description:  lo.ToPtr(sf.Description()),
		MultiValue:   sf.MultiValue(),
		Unique:       sf.Unique(),
		Required:     sf.Required(),
		CreatedAt:    sf.CreatedAt(),
		UpdatedAt:    sf.UpdatedAt(),
	}
}

func ToSchemaFieldTypeProperty(tp *schema.TypeProperty) (res SchemaFieldTypeProperty) {
	tp.Match(schema.TypePropertyMatch{
		Text: func(f *schema.FieldText) {
			res = &SchemaFieldText{
				DefaultValue: f.DefaultValue(),
				MaxLength:    f.MaxLength(),
			}
		},
		TextArea: func(f *schema.FieldTextArea) {
			res = &SchemaFieldTextArea{
				DefaultValue: f.DefaultValue(),
				MaxLength:    f.MaxLength(),
			}
		},
		RichText: func(f *schema.FieldRichText) {
			res = &SchemaFieldRichText{
				DefaultValue: f.DefaultValue(),
				MaxLength:    f.MaxLength(),
			}
		},
		Markdown: func(f *schema.FieldMarkdown) {
			res = &SchemaFieldMarkdown{
				DefaultValue: f.DefaultValue(),
				MaxLength:    f.MaxLength(),
			}
		},
		Asset: func(f *schema.FieldAsset) {
			res = &SchemaFieldAsset{
				DefaultValue: IDFromRef(f.DefaultValue()),
			}
		},
		Date: func(f *schema.FieldDate) {
			res = &SchemaFieldDate{
				DefaultValue: f.DefaultValue(),
			}
		},
		Bool: func(f *schema.FieldBool) {
			res = &SchemaFieldBool{
				DefaultValue: f.DefaultValue(),
			}
		},
		Select: func(f *schema.FieldSelect) {
			res = &SchemaFieldSelect{
				DefaultValue: f.DefaultValue(),
				Values:       f.Values(),
			}
		},
		Tag: func(f *schema.FieldTag) {
			res = &SchemaFieldTag{
				DefaultValue: f.DefaultValue(),
				Values:       f.Values(),
			}
		},
		Integer: func(f *schema.FieldInteger) {
			res = &SchemaFieldInteger{
				DefaultValue: f.DefaultValue(),
				Min:          f.Min(),
				Max:          f.Max(),
			}
		},
		Reference: func(f *schema.FieldReference) {
			res = &SchemaFieldReference{
				ModelID: IDFrom(f.ModelID()),
			}
		},
		URL: func(f *schema.FieldURL) {
			res = &SchemaFieldURL{
				DefaultValue: f.DefaultValue(),
			}
		},
	})
	return
}

func ToSchemaTypeProperty(tp *SchemaFieldTypePropertyInput, t ValueType) (*schema.TypeProperty, error) {
	var tpRes schema.TypeProperty
	switch t {
	case ValueTypeText:
		x := tp.Text
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes = *schema.NewFieldTypePropertyText(x.DefaultValue, x.MaxLength)
	case ValueTypeTextArea:
		x := tp.TextArea
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes = *schema.NewFieldTypePropertyTextArea(x.DefaultValue, x.MaxLength)
	case ValueTypeRichText:
		x := tp.RichText
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes = *schema.NewFieldTypePropertyRichText(x.DefaultValue, x.MaxLength)
	case ValueTypeMarkdownText:
		x := tp.MarkdownText
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes = *schema.NewFieldTypePropertyMarkdown(x.DefaultValue, x.MaxLength)
	case ValueTypeAsset:
		x := tp.Asset
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes = *schema.NewFieldTypePropertyAsset(ToIDRef[id.Asset](x.DefaultValue))
	case ValueTypeDate:
		x := tp.Date
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes = *schema.NewFieldTypePropertyDate(x.DefaultValue)
	case ValueTypeBool:
		x := tp.Bool
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes = *schema.NewFieldTypePropertyBool(x.DefaultValue)
	case ValueTypeSelect:
		x := tp.Select
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp1, err := schema.NewFieldTypePropertySelect(x.Values, x.DefaultValue)
		if err != nil {
			return nil, errors.New("invalid type property")
		}
		tpRes = *tp1
	case ValueTypeTag:
		x := tp.Tag
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp1, err := schema.NewFieldTypePropertyTag(x.Values, x.DefaultValue)
		if err != nil {
			return nil, err
		}
		tpRes = *tp1
	case ValueTypeInteger:
		x := tp.Integer
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp1, err := schema.NewFieldTypePropertyInteger(x.DefaultValue, x.Min, x.Max)
		if err != nil {
			return nil, err
		}
		tpRes = *tp1
	case ValueTypeReference:
		x := tp.Reference
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		mId, err := ToID[id.Model](x.ModelID)
		if err != nil {
			return nil, err
		}
		tpRes = *schema.NewFieldTypePropertyReference(mId)
	case ValueTypeURL:
		x := tp.URL
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp1, err := schema.NewFieldTypePropertyURL(x.DefaultValue)
		if err != nil {
			return nil, err
		}
		tpRes = *tp1
	default:
		return nil, errors.New("invalid type property")
	}
	return &tpRes, nil
}

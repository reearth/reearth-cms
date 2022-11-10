package gqlmodel

import (
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
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
		TypeProperty: ToSchemaTypeProperty(sf.TypeProperty(), sf.DefaultValue()),
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

func ToSchemaTypeProperty(tp *schema.TypeProperty, dv *value.Value) (res SchemaFieldTypeProperty) {
	tp.Match(schema.TypePropertyMatch{
		Text: func(f *schema.FieldText) {
			res = &SchemaFieldText{
				DefaultValue: dv.ValueText(),
				MaxLength:    f.MaxLength(),
			}
		},
		TextArea: func(f *schema.FieldTextArea) {
			res = &SchemaFieldTextArea{
				DefaultValue: dv.ValueTextArea(),
				MaxLength:    f.MaxLength(),
			}
		},
		RichText: func(f *schema.FieldRichText) {
			res = &SchemaFieldRichText{
				DefaultValue: dv.ValueRichText(),
				MaxLength:    f.MaxLength(),
			}
		},
		Markdown: func(f *schema.FieldMarkdown) {
			res = &SchemaFieldMarkdown{
				DefaultValue: dv.ValueMarkdown(),
				MaxLength:    f.MaxLength(),
			}
		},
		Asset: func(f *schema.FieldAsset) {
			res = &SchemaFieldAsset{
				DefaultValue: IDFromRef(dv.ValueAsset()),
			}
		},
		Date: func(f *schema.FieldDate) {
			res = &SchemaFieldDate{
				DefaultValue: dv.ValueDate(),
			}
		},
		Bool: func(f *schema.FieldBool) {
			res = &SchemaFieldBool{
				DefaultValue: dv.ValueBool(),
			}
		},
		Select: func(f *schema.FieldSelect) {
			res = &SchemaFieldSelect{
				DefaultValue: dv.ValueSelect(),
				Values:       f.Values(),
			}
		},
		Tag: func(f *schema.FieldTag) {
			res = &SchemaFieldTag{
				DefaultValue: dv.ValueTag(),
				Values:       f.Values(),
			}
		},
		Integer: func(f *schema.FieldInteger) {
			res = &SchemaFieldInteger{
				DefaultValue: pint642pint(dv.ValueInteger()),
				Min:          pint642pint(f.Min()),
				Max:          pint642pint(f.Max()),
			}
		},
		Reference: func(f *schema.FieldReference) {
			res = &SchemaFieldReference{
				ModelID: IDFrom(f.ModelID()),
			}
		},
		URL: func(f *schema.FieldURL) {
			res = &SchemaFieldURL{
				DefaultValue: dv.ValueURL(),
			}
		},
	})
	return
}

func FromSchemaTypeProperty(tp *SchemaFieldTypePropertyInput, t ValueType) (tpRes *schema.TypeProperty, dv *value.Value, err error) {
	switch t {
	case ValueTypeText:
		x := tp.Text
		if x == nil {
			err = errors.New("invalid type property")
			return
		}
		dv, err = value.New(FromValueType(t), x.DefaultValue)
		if err != nil {
			return
		}
		tpRes = schema.NewFieldText(x.MaxLength).TypeProperty()
	case ValueTypeTextArea:
		x := tp.TextArea
		if x == nil {
			err = errors.New("invalid type property")
			return
		}
		dv, err = value.New(FromValueType(t), x.DefaultValue)
		if err != nil {
			return
		}
		tpRes = schema.NewFieldTextArea(x.MaxLength).TypeProperty()
	case ValueTypeRichText:
		x := tp.RichText
		if x == nil {
			err = errors.New("invalid type property")
			return
		}
		dv, err = value.New(FromValueType(t), x.DefaultValue)
		if err != nil {
			return
		}
		tpRes = schema.NewFieldRichText(x.MaxLength).TypeProperty()
	case ValueTypeMarkdownText:
		x := tp.MarkdownText
		if x == nil {
			err = errors.New("invalid type property")
			return
		}
		dv, err = value.New(FromValueType(t), x.DefaultValue)
		if err != nil {
			return
		}
		tpRes = schema.NewFieldMarkdown(x.MaxLength).TypeProperty()
	case ValueTypeAsset:
		x := tp.Asset
		if x == nil {
			err = errors.New("invalid type property")
			return
		}
		dv, err = value.New(FromValueType(t), x.DefaultValue)
		if err != nil {
			return
		}
		tpRes = schema.NewFieldAsset().TypeProperty()
	case ValueTypeDate:
		x := tp.Date
		if x == nil {
			err = errors.New("invalid type property")
			return
		}
		dv, err = value.New(FromValueType(t), x.DefaultValue)
		if err != nil {
			return
		}
		tpRes = schema.NewFieldDate().TypeProperty()
	case ValueTypeBool:
		x := tp.Bool
		if x == nil {
			err = errors.New("invalid type property")
			return
		}
		dv, err = value.New(FromValueType(t), x.DefaultValue)
		if err != nil {
			return
		}
		tpRes = schema.NewFieldBool().TypeProperty()
	case ValueTypeSelect:
		x := tp.Select
		if x == nil {
			err = errors.New("invalid type property")
			return
		}
		dv, err = value.New(FromValueType(t), x.DefaultValue)
		if err != nil {
			return
		}
		tpRes = schema.NewFieldSelect(x.Values).TypeProperty()
	case ValueTypeTag:
		x := tp.Tag
		if x == nil {
			err = errors.New("invalid type property")
			return
		}
		tpRes = schema.NewFieldTag(x.Values).TypeProperty()
	case ValueTypeInteger:
		x := tp.Integer
		if x == nil {
			err = errors.New("invalid type property")
		}
		tp1, err := schema.NewFieldInteger(pint2pint64(x.Min), pint2pint64(x.Max))
		if err != nil {
			return nil, nil, err
		}
		tpRes = tp1.TypeProperty()
	case ValueTypeReference:
		x := tp.Reference
		if x == nil {
			err = errors.New("invalid type property")
		}
		mId, err := ToID[id.Model](x.ModelID)
		if err != nil {
			return nil, nil, err
		}
		tpRes = schema.NewFieldReference(mId).TypeProperty()
	case ValueTypeURL:
		x := tp.URL
		if x == nil {
			err = errors.New("invalid type property")
		}
		dv, err = value.New(FromValueType(t), x.DefaultValue)
		if err != nil {
			return
		}
		tpRes = schema.NewFieldURL().TypeProperty()
	default:
		err = errors.New("invalid type property")
		return
	}
	return
}

func pint642pint(i *int64) *int {
	if i == nil {
		return nil
	}
	return lo.ToPtr(int(*i))
}

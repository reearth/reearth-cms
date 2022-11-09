package gql

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

func ToSchemaTypeProperty(tp *gqlmodel.SchemaFieldTypePropertyInput, t gqlmodel.SchemaFiledType) (*schema.TypeProperty, error) {
	var tpRes *schema.TypeProperty
	var err error
	switch t {
	case gqlmodel.SchemaFiledTypeText:
		x := tp.Text
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes, err = schema.NewFieldTypePropertyText(x.DefaultValue, x.MaxLength)
	case gqlmodel.SchemaFiledTypeTextArea:
		x := tp.TextArea
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes, err = schema.NewFieldTypePropertyTextArea(x.DefaultValue, x.MaxLength)
	case gqlmodel.SchemaFiledTypeRichText:
		x := tp.RichText
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes, err = schema.NewFieldTypePropertyRichText(x.DefaultValue, x.MaxLength)
	case gqlmodel.SchemaFiledTypeMarkdownText:
		x := tp.MarkdownText
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes, err = schema.NewFieldTypePropertyMarkdown(x.DefaultValue, x.MaxLength)
	case gqlmodel.SchemaFiledTypeAsset:
		x := tp.Asset
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes = schema.NewFieldTypePropertyAsset(gqlmodel.ToIDRef[id.Asset](x.DefaultValue))
	case gqlmodel.SchemaFiledTypeDate:
		x := tp.Date
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes = schema.NewFieldTypePropertyDate(x.DefaultValue)
	case gqlmodel.SchemaFiledTypeBool:
		x := tp.Bool
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes = schema.NewFieldTypePropertyBool(x.DefaultValue)
	case gqlmodel.SchemaFiledTypeSelect:
		x := tp.Select
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes, err = schema.NewFieldTypePropertySelect(x.Values, x.DefaultValue)
	case gqlmodel.SchemaFiledTypeTag:
		x := tp.Tag
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes, err = schema.NewFieldTypePropertyTag(x.Values, x.DefaultValue)
	case gqlmodel.SchemaFiledTypeInteger:
		x := tp.Integer
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes, err = schema.NewFieldTypePropertyInteger(x.DefaultValue, x.Min, x.Max)
	case gqlmodel.SchemaFiledTypeReference:
		x := tp.Reference
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		mId, err := gqlmodel.ToID[id.Model](x.ModelID)
		if err != nil {
			return nil, err
		}
		tpRes = schema.NewFieldTypePropertyReference(mId)
	case gqlmodel.SchemaFiledTypeURL:
		x := tp.URL
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tpRes, err = schema.NewFieldTypePropertyURL(x.DefaultValue)
	default:
		return nil, errors.New("invalid type property")
	}
	if err != nil {
		return nil, err
	}
	return tpRes, nil
}

func (r *mutationResolver) CreateField(ctx context.Context, input gqlmodel.CreateFieldInput) (*gqlmodel.FieldPayload, error) {
	mId, err := gqlmodel.ToID[id.Model](input.ModelID)
	if err != nil {
		return nil, err
	}

	m, err := usecases(ctx).Model.FindByIDs(ctx, []id.ModelID{mId}, getOperator(ctx))
	if err != nil || len(m) != 1 {
		return nil, err
	}

	tp, err := ToSchemaTypeProperty(input.TypeProperty, input.Type)
	if err != nil {
		return nil, err
	}

	f, err := usecases(ctx).Schema.CreateField(ctx, interfaces.CreateFieldParam{
		SchemaId:     m[0].Schema(),
		Type:         schema.Type(input.Type),
		Name:         &input.Title,
		Description:  input.Description,
		Key:          &input.Key,
		MultiValue:   input.MultiValue,
		Unique:       input.Unique,
		Required:     input.Required,
		TypeProperty: *tp,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.FieldPayload{
		Field: gqlmodel.ToSchemaField(f),
	}, nil
}

func (r *mutationResolver) UpdateField(ctx context.Context, input gqlmodel.UpdateFieldInput) (*gqlmodel.FieldPayload, error) {
	fId, err := gqlmodel.ToID[id.Field](input.FieldID)
	if err != nil {
		return nil, err
	}

	mId, err := gqlmodel.ToID[id.Model](input.ModelID)
	if err != nil {
		return nil, err
	}

	ms, err := usecases(ctx).Model.FindByIDs(ctx, []id.ModelID{mId}, getOperator(ctx))
	if err != nil || len(ms) != 1 || ms[0].ID() != mId {
		if err == nil {
			return nil, errors.New("not found")
		}
		return nil, err
	}
	m := ms[0]

	s, err := usecases(ctx).Schema.FindByID(ctx, m.Schema(), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	dbField := s.Field(fId)

	tp, err := ToSchemaTypeProperty(input.TypeProperty, gqlmodel.ToSchemaFieldType(dbField.Type()))
	if err != nil {
		return nil, err
	}

	f, err := usecases(ctx).Schema.UpdateField(ctx, interfaces.UpdateFieldParam{
		SchemaId:     m.Schema(),
		FieldId:      fId,
		Name:         input.Title,
		Description:  input.Description,
		Key:          input.Key,
		MultiValue:   input.MultiValue,
		Unique:       input.Unique,
		Required:     input.Required,
		TypeProperty: *tp,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.FieldPayload{
		Field: gqlmodel.ToSchemaField(f),
	}, nil
}

func (r *mutationResolver) DeleteField(ctx context.Context, input gqlmodel.DeleteFieldInput) (*gqlmodel.DeleteFieldPayload, error) {
	fId, err := gqlmodel.ToID[id.Field](input.FieldID)
	if err != nil {
		return nil, err
	}

	mId, err := gqlmodel.ToID[id.Model](input.ModelID)
	if err != nil {
		return nil, err
	}

	m, err := usecases(ctx).Model.FindByIDs(ctx, []id.ModelID{mId}, getOperator(ctx))
	if err != nil || len(m) != 1 {
		return nil, err
	}

	if err := usecases(ctx).Schema.DeleteField(ctx, m[0].Schema(), fId, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteFieldPayload{
		FieldID: input.FieldID,
	}, nil
}

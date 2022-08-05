package gql

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

func (r *mutationResolver) CreateField(ctx context.Context, input gqlmodel.CreateFieldInput) (*gqlmodel.FieldPayload, error) {
	mId, err := gqlmodel.ToID[id.Model](input.ModelID)
	if err != nil {
		return nil, err
	}

	m, err := usecases(ctx).Model.FindByIDs(ctx, []id.ModelID{mId}, getOperator(ctx))
	if err != nil || len(m) != 1 {
		return nil, err
	}

	var tp schema.TypeProperty
	switch input.Type {
	case gqlmodel.SchemaFiledTypeText:
		x := input.TypeProperty.Text
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp = *schema.NewFieldTypePropertyText(x.DefaultValue, x.MaxLength)
	case gqlmodel.SchemaFiledTypeTextArea:
		x := input.TypeProperty.TextArea
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp = *schema.NewFieldTypePropertyTextArea(x.DefaultValue, x.MaxLength)
	case gqlmodel.SchemaFiledTypeRichText:
		x := input.TypeProperty.RichText
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp = *schema.NewFieldTypePropertyRichText(x.DefaultValue, x.MaxLength)
	case gqlmodel.SchemaFiledTypeMarkdownText:
		x := input.TypeProperty.MarkdownText
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp = *schema.NewFieldTypePropertyMarkdown(x.DefaultValue, x.MaxLength)
	case gqlmodel.SchemaFiledTypeAsset:
		x := input.TypeProperty.Asset
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp = *schema.NewFieldTypePropertyAsset(gqlmodel.ToIDRef[id.Asset](x.DefaultValue))
	case gqlmodel.SchemaFiledTypeDate:
		x := input.TypeProperty.Date
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp = *schema.NewFieldTypePropertyDate(x.DefaultValue)
	case gqlmodel.SchemaFiledTypeBool:
		x := input.TypeProperty.Bool
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp = *schema.NewFieldTypePropertyBool(x.DefaultValue)
	case gqlmodel.SchemaFiledTypeSelect:
		x := input.TypeProperty.Select
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp1, err := schema.NewFieldTypePropertySelect(x.Values, x.DefaultValue)
		if err != nil {
			return nil, errors.New("invalid type property")
		}
		tp = *tp1
	case gqlmodel.SchemaFiledTypeTag:
		x := input.TypeProperty.Tag
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp1, err := schema.NewFieldTypePropertyTag(x.Values, x.DefaultValue)
		if err != nil {
			return nil, err
		}
		tp = *tp1
	case gqlmodel.SchemaFiledTypeInteger:
		x := input.TypeProperty.Integer
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp1, err := schema.NewFieldTypePropertyInteger(x.DefaultValue, x.Min, x.Max)
		if err != nil {
			return nil, err
		}
		tp = *tp1
	case gqlmodel.SchemaFiledTypeReference:
		x := input.TypeProperty.Reference
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		mId, err := gqlmodel.ToID[id.Model](x.ModelID)
		if err != nil {
			return nil, err
		}
		tp = *schema.NewFieldTypePropertyReference(mId)
	case gqlmodel.SchemaFiledTypeURL:
		x := input.TypeProperty.URL
		if x == nil {
			return nil, errors.New("invalid type property")
		}
		tp = *schema.NewFieldTypePropertyURL(x.DefaultValue)
	default:
		return nil, errors.New("invalid type property")
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
		TypeProperty: tp,
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

	m, err := usecases(ctx).Model.FindByIDs(ctx, []id.ModelID{mId}, getOperator(ctx))
	if err != nil || len(m) != 1 {
		return nil, err
	}

	f, err := usecases(ctx).Schema.UpdateField(ctx, interfaces.UpdateFieldParam{
		SchemaId:     m[0].Schema(),
		FieldId:      fId,
		Name:         input.Title,
		Description:  input.Description,
		Key:          input.Key,
		TypeProperty: schema.TypeProperty{},
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

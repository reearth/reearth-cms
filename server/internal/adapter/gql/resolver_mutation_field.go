package gql

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
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

	tp, err := gqlmodel.ToSchemaTypeProperty(input.TypeProperty, input.Type)
	if err != nil {
		return nil, err
	}

	f, err := usecases(ctx).Schema.CreateField(ctx, interfaces.CreateFieldParam{
		SchemaId:     m[0].Schema(),
		Type:         gqlmodel.FromValueType(input.Type),
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

	tp, err := gqlmodel.ToSchemaTypeProperty(input.TypeProperty, gqlmodel.ToValueType(dbField.Type()))
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

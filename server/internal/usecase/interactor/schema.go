package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

type Schema struct {
	repos *repo.Container
}

func NewSchema(r *repo.Container) interfaces.Schema {
	return &Schema{
		repos: r,
	}
}

func (i Schema) FindByID(ctx context.Context, id id.SchemaID, operator *usecase.Operator) (*schema.Schema, error) {
	return i.repos.Schema.FindByID(ctx, id)
}

func (i Schema) FindByIDs(ctx context.Context, ids []id.SchemaID, operator *usecase.Operator) (schema.List, error) {
	return i.repos.Schema.FindByIDs(ctx, ids)
}

func (i Schema) CreateField(ctx context.Context, param interfaces.CreateFieldParam, operator *usecase.Operator) (*schema.Field, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*schema.Field, error) {
		s, err := i.repos.Schema.FindByID(ctx, param.SchemaId)
		if err != nil {
			return nil, err
		}

		if !operator.IsWritableWorkspace(s.Workspace()) {
			return nil, interfaces.ErrOperationDenied
		}

		if s.HasFieldByKey(param.Key) {
			return nil, interfaces.ErrInvalidKey
		}

		f, err := schema.NewField(param.TypeProperty).
			NewID().
			Options(param.Unique, param.MultiValue, param.Required).
			Name(*param.Name).
			Description(*param.Description).
			Key(key.New(param.Key)).
			Options(param.Unique, param.MultiValue, param.Required).
			Build()
		if err != nil {
			return nil, err
		}

		s.AddField(f)

		if err := i.repos.Schema.Save(ctx, s); err != nil {
			return nil, err
		}

		return f, nil
	})
}

func (i Schema) UpdateField(ctx context.Context, param interfaces.UpdateFieldParam, operator *usecase.Operator) (*schema.Field, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*schema.Field, error) {
		s, err := i.repos.Schema.FindByID(ctx, param.SchemaId)
		if err != nil {
			return nil, err
		}

		if !operator.IsWritableWorkspace(s.Workspace()) {
			return nil, interfaces.ErrOperationDenied
		}

		f := s.Field(param.FieldId)
		if f == nil {
			return nil, interfaces.ErrFieldNotFound
		}

		if param.TypeProperty != nil {
			f.SetTypeProperty(param.TypeProperty)
		}

		if param.Name != nil {
			f.SetName(*param.Name)
		}

		if param.Description != nil {
			f.SetDescription(*param.Description)
		}

		if param.Key != nil {
			if err := f.SetKey(key.New(*param.Key)); err != nil {
				return nil, err
			}
		}

		if param.Required != nil {
			f.SetRequired(*param.Required)
		}

		if param.Unique != nil {
			f.SetUnique(*param.Unique)
		}

		if param.MultiValue != nil {
			f.SetMultiValue(*param.MultiValue)
		}

		if err := i.repos.Schema.Save(ctx, s); err != nil {
			return nil, err
		}

		return f, nil
	})
}

func (i Schema) DeleteField(ctx context.Context, schemaId id.SchemaID, fieldID id.FieldID, operator *usecase.Operator) error {
	return Run0(ctx, operator, i.repos, Usecase().Transaction(), func() error {
		s, err := i.repos.Schema.FindByID(ctx, schemaId)
		if err != nil {
			return err
		}

		if !operator.IsWritableWorkspace(s.Workspace()) {
			return interfaces.ErrOperationDenied
		}

		s.RemoveField(fieldID)
		return i.repos.Schema.Save(ctx, s)
	})
}

package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
)

type Schema struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewSchema(r *repo.Container, g *gateway.Container) interfaces.Schema {
	return &Schema{
		repos:    r,
		gateways: g,
	}
}

func (i Schema) FindByID(ctx context.Context, id id.SchemaID, operator *usecase.Operator) (*schema.Schema, error) {
	return i.repos.Schema.FindByID(ctx, id)
}

func (i Schema) FindByIDs(ctx context.Context, ids []id.SchemaID, operator *usecase.Operator) (schema.List, error) {
	return i.repos.Schema.FindByIDs(ctx, ids)
}

func (i Schema) CreateField(ctx context.Context, param interfaces.CreateFieldParam, operator *usecase.Operator) (*schema.Field, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (*schema.Field, error) {
		s1, err := i.repos.Schema.FindByID(ctx, param.SchemaId)
		if err != nil {
			return nil, err
		}

		if !operator.IsMaintainingProject(s1.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		if param.Key == "" || s1.HasFieldByKey(param.Key) {
			return nil, schema.ErrInvalidKey
		}

		f1, err := schema.NewField(param.TypeProperty).
			NewID().
			Unique(param.Unique).
			Multiple(param.Multiple).
			Required(param.Required).
			Name(param.Name).
			Description(lo.FromPtr(param.Description)).
			Key(key.New(param.Key)).
			DefaultValue(param.DefaultValue).
			Build()
		if err != nil {
			return nil, err
		}

		if param.Type == "Reference" {
			var err error
			var f2 *schema.Field
			// set corresponding field in f1 to f2
			f1.TypeProperty().Match(schema.TypePropertyMatch{
				Reference: func(f *schema.FieldReference) {
					if f.CorrespondingField() != nil {
						f2, err = i.createCorrespondingField(ctx, f, f1, param.ModelId, operator)
						if err == nil {
							f.SetCorrespondingField(f2.ID().Ref())
						}
					}
				},
			})
			if err != nil {
				return nil, err
			}
		}

		s1.AddField(f1)

		if err := i.repos.Schema.Save(ctx, s1); err != nil {
			return nil, err
		}

		return f1, nil
	})
}

func (i Schema) createCorrespondingField(ctx context.Context, fr *schema.FieldReference, f1 *schema.Field, mId1 id.ModelID, operator *usecase.Operator) (*schema.Field, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (*schema.Field, error) {
		cf1 := fr.CorrespondingField()
		mId2 := fr.Model()
		m2, err := i.repos.Model.FindByID(ctx, mId2)
		if err != nil {
			return nil, err
		}
		s2, err := i.repos.Schema.FindByID(ctx, m2.Schema())
		if err != nil {
			return nil, err
		}

		if !operator.IsMaintainingProject(s2.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		if cf1.Key == nil || s2.HasFieldByKey(lo.FromPtr(cf1.Key)) {
			return nil, schema.ErrInvalidKey
		}

		// set f2 type property, modelId = mId1, cf2 = f1
		cf2 := &schema.CorrespondingField{
			FieldID:     f1.ID().Ref(),
			Title:       lo.ToPtr(f1.Name()),
			Key:         lo.ToPtr(f1.Key().String()),
			Description: lo.ToPtr(f1.Description()),
			Required:    lo.ToPtr(f1.Required()),
		}
		tp := schema.NewReference(mId1, cf2, f1.ID().Ref()).TypeProperty()

		// create f2 from cf1
		f2, err := schema.NewField(tp).
			NewID().
			Unique(false).
			Multiple(false).
			Required(lo.FromPtr(cf1.Required)).
			Name(lo.FromPtr(cf1.Title)).
			Description(lo.FromPtr(cf1.Description)).
			Key(key.New(lo.FromPtr(cf1.Key))).
			DefaultValue(nil).
			Build()
		if err != nil {
			return nil, err
		}

		s2.AddField(f2)

		if err := i.repos.Schema.Save(ctx, s2); err != nil {
			return nil, err
		}

		return f2, nil
	})
}

func (i Schema) UpdateField(ctx context.Context, param interfaces.UpdateFieldParam, operator *usecase.Operator) (*schema.Field, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (*schema.Field, error) {
		s, err := i.repos.Schema.FindByID(ctx, param.SchemaId)
		if err != nil {
			return nil, err
		}

		if !operator.IsMaintainingProject(s.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		f := s.Field(param.FieldId)
		if f == nil {
			return nil, interfaces.ErrFieldNotFound
		}

		if err := updateField(param, f); err != nil {
			return nil, err
		}
		if err := i.repos.Schema.Save(ctx, s); err != nil {
			return nil, err
		}

		return f, nil
	})
}

func (i Schema) DeleteField(ctx context.Context, schemaId id.SchemaID, fieldID id.FieldID, operator *usecase.Operator) error {
	return Run0(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) error {
			s, err := i.repos.Schema.FindByID(ctx, schemaId)
			if err != nil {
				return err
			}

			if !operator.IsMaintainingProject(s.Project()) {
				return interfaces.ErrOperationDenied
			}

			s.RemoveField(fieldID)
			return i.repos.Schema.Save(ctx, s)
		})
}

func (i Schema) UpdateFields(ctx context.Context, sid id.SchemaID, params []interfaces.UpdateFieldParam, operator *usecase.Operator) (schema.FieldList, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (schema.FieldList, error) {
		s, err := i.repos.Schema.FindByID(ctx, sid)
		if err != nil {
			return nil, err
		}
		if !operator.IsMaintainingProject(s.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		for _, param := range params {
			f := s.Field(param.FieldId)
			if f == nil {
				return nil, interfaces.ErrFieldNotFound
			}
			err = updateField(param, f)
			if err != nil {
				return nil, err
			}
		}
		if err := i.repos.Schema.Save(ctx, s); err != nil {
			return nil, err
		}

		return nil, nil
	})
}

func updateField(param interfaces.UpdateFieldParam, f *schema.Field) error {
	if param.TypeProperty != nil {
		if param.DefaultValue != nil {
			_ = f.SetDefaultValue(nil)
		}
		if err := f.SetTypeProperty(param.TypeProperty); err != nil {
			return err
		}
	}

	if param.DefaultValue != nil {
		if err := f.SetDefaultValue(param.DefaultValue); err != nil {
			return err
		}
	}

	if param.Key != nil {
		if err := f.SetKey(key.New(*param.Key)); err != nil {
			return err
		}
	}

	if param.Name != nil {
		f.SetName(*param.Name)
	}

	if param.Description != nil {
		f.SetDescription(*param.Description)
	}

	if param.Order != nil {
		f.SetOrder(*param.Order)
	}

	if param.Required != nil {
		f.SetRequired(*param.Required)
	}

	if param.Unique != nil {
		f.SetUnique(*param.Unique)
	}

	if param.Multiple != nil {
		f.SetMultiple(*param.Multiple)
	}
	return nil
}

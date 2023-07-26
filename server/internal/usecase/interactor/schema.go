package interactor

import (
	"context"
	"github.com/reearth/reearth-cms/server/pkg/model"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
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
		s, err := i.repos.Schema.FindByID(ctx, param.SchemaId)
		if err != nil {
			return nil, err
		}

		if !operator.IsMaintainingProject(s.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		if param.Key == "" || s.HasFieldByKey(param.Key) {
			return nil, schema.ErrInvalidKey
		}

		// TODO:
		// if the value is a reference and there is a linkedTo attribute:
		// 1- create field on source schema
		// 2- Get the schema by model id
		// 3- create a new reference field to the destination schema
		// 4- update the created field on the source schema with the destination schema reference field id
		// 5- save the source and destination schemas

		srcField := id.NewFieldID() // add to the referenced field type property

		var cf *schema.Field
		var cfm *model.Model
		var cfbID id.FieldID
		if param.TypeProperty.Type() == value.TypeReference {
			// add Find By schema function to the model infra
			//srcModel, err := i.repos.Model.Fi(ctx, param.SchemaId)
			//if err != nil {
			//	return nil, err
			//}
			param.TypeProperty.Match(schema.TypePropertyMatch{
				Reference: func(r *schema.FieldReference) {
					//cfp := r.CorrespondingField()
					if cf != nil {
						cfm, err1 := i.repos.Model.FindByID(ctx, r.Model())
						if err1 != nil {
							return
						}
						cfs, err1 := i.repos.Schema.FindByID(ctx, cfm.Schema())
						if err1 != nil {
							return
						}
						//cfbID = id.NewFieldID()
						//cf = schema.NewField(schema.NewReference(srcModel,srcField.Ref()).TypeProperty()).
						//	ID(cfbID).
						//	Unique(cfp.Unique).
						//	Multiple(cfp.Multiple).
						//	Required(cfp.Required).
						//	Name(cfpName).
						//	Description(lo.FromPtr(cfp.Description)).
						//	Key(key.New(cfp.Key)).Build()
						cfs.AddField(cf)
					}
				},
			})
		}
		var tp *schema.TypeProperty
		if cf != nil {
			tp = schema.NewReference(cfm.ID(), cfbID.Ref()).TypeProperty()
		} else {
			tp = param.TypeProperty
		}
		f, err := schema.NewField(tp).
			ID(srcField).
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

		s.AddField(f)

		if err := i.repos.Schema.Save(ctx, s); err != nil {
			return nil, err
		}

		return f, nil
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

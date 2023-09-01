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
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
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
		s1, err := i.repos.Schema.FindByID(ctx, param.SchemaID)
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
			err = i.createCorrespondingField(ctx, s1, f1, param, operator)
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

func (i Schema) createCorrespondingField(ctx context.Context, s1 *schema.Schema, f1 *schema.Field, param interfaces.CreateFieldParam, operator *usecase.Operator) error {
	fr, _ := schema.FieldReferenceFromTypeProperty(f1.TypeProperty())
	// check if reference direction is two way
	if fr.CorrespondingField() != nil {
		mid2 := fr.Model()
		m2, err := i.repos.Model.FindByID(ctx, mid2)
		if err != nil {
			return err
		}
		s2, err := i.repos.Schema.FindByID(ctx, m2.Schema())
		if err != nil {
			return err
		}

		if !operator.IsMaintainingProject(s2.Project()) {
			return interfaces.ErrOperationDenied
		}

		fr.SetCorrespondingSchema(s2.ID().Ref())
		fields, err := schema.GetCorrespondingFields(s1, s2, param.ModelID, f1, fr)
		if err != nil {
			return err
		}

		fields.Schema2.AddField(fields.Field2)

		if err := i.repos.Schema.Save(ctx, fields.Schema2); err != nil {
			return err
		}
	}
	return nil
}

func (i Schema) UpdateField(ctx context.Context, param interfaces.UpdateFieldParam, operator *usecase.Operator) (*schema.Field, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func(ctx context.Context) (*schema.Field, error) {
		s1, err := i.repos.Schema.FindByID(ctx, param.SchemaID)
		if err != nil {
			return nil, err
		}

		if !operator.IsMaintainingProject(s1.Project()) {
			return nil, interfaces.ErrOperationDenied
		}

		f1 := s1.Field(param.FieldID)
		if f1 == nil {
			return nil, interfaces.ErrFieldNotFound
		}

		// check if type is reference
		if f1.Type() == value.TypeReference {
			err := i.updateCorrespondingField(ctx, s1, f1, param, operator)
			if err != nil {
				return nil, err
			}
		}

		if err := updateField(param, f1); err != nil {
			return nil, err
		}
		if err := i.repos.Schema.Save(ctx, s1); err != nil {
			return nil, err
		}

		return f1, nil
	})
}

func (i Schema) updateCorrespondingField(ctx context.Context, s1 *schema.Schema, f1 *schema.Field, param interfaces.UpdateFieldParam, operator *usecase.Operator) error {
	oldFr, _ := schema.FieldReferenceFromTypeProperty(f1.TypeProperty())
	newFr, _ := schema.FieldReferenceFromTypeProperty(param.TypeProperty)
	// check if reference direction is two way
	if newFr.CorrespondingField() != nil {
		mId2 := oldFr.Model()
		m2, err := i.repos.Model.FindByID(ctx, mId2)
		if err != nil {
			return err
		}
		s2, err := i.repos.Schema.FindByID(ctx, m2.Schema())
		if err != nil {
			return err
		}

		if !operator.IsMaintainingProject(s2.Project()) {
			return interfaces.ErrOperationDenied
		}

		// check if modelId is different
		if oldFr.Model() == newFr.Model() {
			// if modelId is same, update f2
			cf1 := newFr.CorrespondingField()
			f2 := s2.Field(*cf1.FieldID)
			if f2 == nil {
				return interfaces.ErrFieldNotFound
			}
			if err := updateField(interfaces.UpdateFieldParam{
				ModelID:     mId2,
				SchemaID:    m2.Schema(),
				FieldID:     *cf1.FieldID,
				Name:        cf1.Title,
				Description: cf1.Description,
				Key:         cf1.Key,
				Required:    cf1.Required,
			}, f2); err != nil {
				return err
			}
			if err := i.repos.Schema.Save(ctx, s2); err != nil {
				return err
			}
		} else {
			// delete the old corresponding field
			s2.RemoveField(*oldFr.CorrespondingFieldID())
			if err := i.repos.Schema.Save(ctx, s2); err != nil {
				return err
			}
			// create the new corresponding field
			mid3 := newFr.Model()
			m3, err := i.repos.Model.FindByID(ctx, mid3)
			if err != nil {
				return err
			}
			s3, err := i.repos.Schema.FindByID(ctx, m3.Schema())
			if err != nil {
				return err
			}

			if !operator.IsMaintainingProject(s3.Project()) {
				return interfaces.ErrOperationDenied
			}

			fields, err := schema.GetCorrespondingFields(s1, s3, param.ModelID, f1, newFr)
			if err != nil {
				return err
			}
			if err != nil {
				return err
			}

			fields.Schema2.AddField(fields.Field2)
			if err := i.repos.Schema.Save(ctx, fields.Schema2); err != nil {
				return err
			}
		}
	}
	return nil
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

			f := s.Field(fieldID)
			if f.Type() == value.TypeReference {
				err := i.deleteCorrespondingField(ctx, s, f, operator)
				if err != nil {
					return err
				}
			}

			s.RemoveField(fieldID)
			return i.repos.Schema.Save(ctx, s)
		})
}

func (i Schema) deleteCorrespondingField(ctx context.Context, s *schema.Schema, f *schema.Field, operator *usecase.Operator) error {
	fr, _ := schema.FieldReferenceFromTypeProperty(f.TypeProperty())
	cfid := fr.CorrespondingFieldID()

	// check if reference direction is two way
	if cfid != nil {
		ms, err := i.repos.Model.FindByIDs(ctx, []id.ModelID{fr.Model()})
		if err != nil || len(ms) != 1 {
			if err == nil {
				return rerror.NewE(i18n.T("not found"))
			}
			return err
		}
		m := ms[0]

		s2, err := i.repos.Schema.FindByID(ctx, m.Schema())
		if err != nil {
			return err
		}

		s2.RemoveField(*cfid)
		if err := i.repos.Schema.Save(ctx, s2); err != nil {
			return err
		}
	}
	return nil
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
			f := s.Field(param.FieldID)
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

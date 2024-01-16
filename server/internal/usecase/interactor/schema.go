package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/group"
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

func (i Schema) FindByModel(ctx context.Context, mID id.ModelID, _ *usecase.Operator) (*schema.Package, error) {
	m, err := i.repos.Model.FindByID(ctx, mID)
	if err != nil {
		return nil, err
	}

	sIDs := id.SchemaIDList{m.Schema()}
	if m.Metadata() != nil {
		sIDs = append(sIDs, *m.Metadata())
	}
	sList, err := i.repos.Schema.FindByIDs(ctx, sIDs)
	if err != nil {
		return nil, err
	}
	s := sList.Schema(lo.ToPtr(m.Schema()))
	if s == nil {
		return nil, nil
	}

	gIds := lo.Map(s.FieldsByType(value.TypeGroup), func(f *schema.Field, _ int) id.GroupID {
		var gID id.GroupID
		f.TypeProperty().Match(schema.TypePropertyMatch{
			Group: func(f *schema.FieldGroup) {
				gID = f.Group()
			},
		})
		return gID
	})

	groups, err := i.repos.Group.FindByIDs(ctx, gIds)
	if err != nil {
		return nil, err
	}

	gsl, err := i.repos.Schema.FindByIDs(ctx, groups.SchemaIDs())
	if err != nil {
		return nil, err
	}
	gm := lo.SliceToMap(groups, func(g *group.Group) (id.GroupID, *schema.Schema) {
		return g.ID(), gsl.Schema(lo.ToPtr(g.Schema()))
	})

	return schema.NewPackage(s, sList.Schema(m.Metadata()), gm), nil
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

		if param.Type == value.TypeReference {
			err = i.createCorrespondingField(ctx, s1, f1, param, operator)
			if err != nil {
				return nil, err
			}
		}

		if param.Type == value.TypeGroup {
			var g *schema.FieldGroup
			param.TypeProperty.Match(schema.TypePropertyMatch{
				Group: func(f *schema.FieldGroup) {
					g = f
				},
			})
			_, err = i.repos.Group.FindByID(ctx, g.Group())
			if err != nil {
				return nil, err
			}
		}

		s1.AddField(f1)

		if err := setTitleField(&param.IsTitle, s1, f1.ID().Ref()); err != nil {
			return nil, err
		}

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
		var s2 *schema.Schema
		// check self reference
		if param.ModelID != nil && mid2 == *param.ModelID {
			s2 = s1
		} else {
			m2, err := i.repos.Model.FindByID(ctx, mid2)
			if err != nil {
				return err
			}
			s2, err = i.repos.Schema.FindByID(ctx, m2.Schema())
			if err != nil {
				return err
			}

			if !operator.IsMaintainingProject(s2.Project()) {
				return interfaces.ErrOperationDenied
			}
		}

		fr.SetCorrespondingSchema(s2.ID().Ref())
		fields, err := schema.GetCorrespondingFields(s1, s2, *param.ModelID, f1, fr)
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

		if f1.Type() == value.TypeGroup {
			var g *schema.FieldGroup
			param.TypeProperty.Match(schema.TypePropertyMatch{
				Group: func(f *schema.FieldGroup) {
					g = f
				},
			})
			_, err = i.repos.Group.FindByID(ctx, g.Group())
			if err != nil {
				return nil, err
			}
		}

		if err := updateField(param, f1); err != nil {
			return nil, err
		}

		if err := setTitleField(param.IsTitle, s1, f1.ID().Ref()); err != nil {
			return nil, err
		}

		if err := i.repos.Schema.Save(ctx, s1); err != nil {
			return nil, err
		}

		return f1, nil
	})
}

func setTitleField(isTitle *bool, s *schema.Schema, fid *id.FieldID) error {
	if isTitle == nil || s == nil || fid == nil {
		return nil
	}

	if *isTitle {
		// Set title field if isTitle is true
		if err := s.SetTitleField(fid.Ref()); err != nil {
			return err
		}
	} else if s.TitleField() != nil && *s.TitleField() == *fid {
		// Unset title field if isTitle is false and the current field is the title field
		if err := s.SetTitleField(nil); err != nil {
			return err
		}
	}

	return nil
}

func (i Schema) updateCorrespondingField(ctx context.Context, s1 *schema.Schema, f1 *schema.Field, param interfaces.UpdateFieldParam, operator *usecase.Operator) error {
	oldFr, _ := schema.FieldReferenceFromTypeProperty(f1.TypeProperty())
	newFr, _ := schema.FieldReferenceFromTypeProperty(param.TypeProperty)
	// check if reference direction is two way
	if newFr.CorrespondingField() != nil {
		mid2 := oldFr.Model()
		m2, err := i.repos.Model.FindByID(ctx, mid2)
		if err != nil {
			return err
		}
		var s2 *schema.Schema
		// check self reference
		if param.ModelID != nil && mid2 == *param.ModelID {
			s2 = s1
		} else {
			s2, err = i.repos.Schema.FindByID(ctx, m2.Schema())
			if err != nil {
				return err
			}
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
				ModelID:     mid2.Ref(),
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

			fields, err := schema.GetCorrespondingFields(s1, s3, *param.ModelID, f1, newFr)
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
			if f == nil {
				return interfaces.ErrFieldNotFound
			}
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
		// check self reference
		if s2.ID() == s.ID() {
			s2 = s
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
	if param.Multiple != nil {
		f.SetMultiple(*param.Multiple)
	}

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

	return nil
}

func (i Schema) GetSchemasAndGroupSchemasByIDs(ctx context.Context, list id.SchemaIDList, operator *usecase.Operator) (schemas schema.List, groupSchemas schema.List, err error) {
	schemas, err = i.repos.Schema.FindByIDs(ctx, list)
	if err != nil {
		return
	}
	var gIds id.GroupIDList
	for _, s := range schemas {
		sg := lo.Filter(s.Fields(), func(f *schema.Field, _ int) bool {
			return f.Type() == value.TypeGroup
		})
		gIds = lo.Map(sg, func(sf *schema.Field, _ int) id.GroupID {
			var g id.GroupID
			sf.TypeProperty().Match(schema.TypePropertyMatch{
				Group: func(f *schema.FieldGroup) {
					g = f.Group()
				},
			})
			return g
		})
	}
	groups, err1 := i.repos.Group.FindByIDs(ctx, gIds)
	if err1 != nil {
		return nil, nil, err1
	}

	gsl, err1 := i.repos.Schema.FindByIDs(ctx, groups.SchemaIDs())
	if err1 != nil {
		return nil, nil, err1
	}
	groupSchemas = append(groupSchemas, gsl...)
	return
}

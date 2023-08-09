package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func (r *mutationResolver) CreateField(ctx context.Context, input gqlmodel.CreateFieldInput) (*gqlmodel.FieldPayload, error) {
	f1, s1, err := createField(ctx, input)
	if err != nil {
		return nil, err
	}

	if input.Type == gqlmodel.SchemaFieldTypeReference {
		cf := input.TypeProperty.Reference.CorrespondingField
		if cf != nil {
			f2, s2, err := createField(ctx, lo.FromPtr(cf.Create))
			if err != nil {
				return nil, err
			}
			f1.TypeProperty().Match(schema.TypePropertyMatch{
				Reference: func(f *schema.FieldReference) {
					f.SetCorrespondingField(f2.ID().Ref())
				},
			})
			f1, err = usecases(ctx).Schema.UpdateField(ctx, interfaces.UpdateFieldParam{
				SchemaId:     *s1,
				FieldId:      f1.ID(),
				TypeProperty: f1.TypeProperty(),
			}, getOperator(ctx))
			if err != nil {
				return nil, err
			}

			f2.TypeProperty().Match(schema.TypePropertyMatch{
				Reference: func(f *schema.FieldReference) {
					f.SetCorrespondingField(f1.ID().Ref())
				},
			})
			_, err = usecases(ctx).Schema.UpdateField(ctx, interfaces.UpdateFieldParam{
				SchemaId:     *s2,
				FieldId:      f2.ID(),
				TypeProperty: f2.TypeProperty(),
			}, getOperator(ctx))
			if err != nil {
				return nil, err
			}
		}
	}

	return &gqlmodel.FieldPayload{
		Field: gqlmodel.ToSchemaField(f1),
	}, nil
}

func createField(ctx context.Context, input gqlmodel.CreateFieldInput) (*schema.Field, *id.SchemaID, error) {
	mId, err := gqlmodel.ToID[id.Model](input.ModelID)
	if err != nil {
		return nil, nil, err
	}

	m, err := usecases(ctx).Model.FindByIDs(ctx, []id.ModelID{mId}, getOperator(ctx))
	if err != nil || len(m) != 1 {
		return nil, nil, err
	}

	tp, dv, err := gqlmodel.FromSchemaTypeProperty(input.TypeProperty, input.Type, input.Multiple)
	if err != nil {
		return nil, nil, err
	}

	f, err := usecases(ctx).Schema.CreateField(ctx, interfaces.CreateFieldParam{
		SchemaId:     m[0].Schema(),
		Type:         value.Type(input.Type),
		Name:         input.Title,
		Description:  input.Description,
		Key:          input.Key,
		Multiple:     input.Multiple,
		Unique:       input.Unique,
		IsTitle:      input.IsTitle,
		Required:     input.Required,
		DefaultValue: dv,
		TypeProperty: tp,
	}, getOperator(ctx))
	if err != nil {
		return nil, nil, err
	}

	return f, lo.ToPtr(m[0].Schema()), nil
}

func (r *mutationResolver) UpdateField(ctx context.Context, input gqlmodel.UpdateFieldInput) (*gqlmodel.FieldPayload, error) {
	f1, _, s1, err := getFieldData(ctx, input.FieldID, input.ModelID)
	if err != nil {
		return nil, err
	}
	// check if type is reference
	if f1.Type() == value.TypeReference && input.TypeProperty != nil {
		cf := input.TypeProperty.Reference.CorrespondingField
		// check if reference direction is two way
		if cf != nil {
			var err1 error
			f1.TypeProperty().Match(schema.TypePropertyMatch{
				Reference: func(f *schema.FieldReference) {
					// check if modelId is different
					if gqlmodel.ID(f.Model().String()) != input.TypeProperty.Reference.ModelID {
						// delete the old corresponding field
						f2, _, s2, err := getFieldData(ctx, gqlmodel.ID(f.CorrespondingField().String()), gqlmodel.ID(f.Model().String()))
						err1 = err
						err1 = usecases(ctx).Schema.DeleteField(ctx, s2.ID(), f2.ID(), getOperator(ctx))

						// create new corresponding field
						i := gqlmodel.CreateFieldInput{
							ModelID:      cf.Update.ModelID,
							Type:         gqlmodel.SchemaFieldTypeReference,
							Title:        *cf.Update.Title,
							Description:  cf.Update.Description,
							Key:          *cf.Update.Key,
							Multiple:     *cf.Update.Multiple,
							Unique:       *cf.Update.Unique,
							IsTitle:      cf.Update.IsTitle,
							Required:     *cf.Update.Required,
							TypeProperty: cf.Update.TypeProperty,
						}
						f3, sid3, err := createField(ctx, i)
						err1 = err
						f.SetCorrespondingField(f3.ID().Ref())

						f3.TypeProperty().Match(schema.TypePropertyMatch{
							Reference: func(f *schema.FieldReference) {
								f.SetCorrespondingField(f1.ID().Ref())
							},
						})
						_, err1 = usecases(ctx).Schema.UpdateField(ctx, interfaces.UpdateFieldParam{
							SchemaId:     *sid3,
							FieldId:      f3.ID(),
							TypeProperty: f3.TypeProperty(),
						}, getOperator(ctx))
						_, err1 = updateField(ctx, lo.FromPtr(cf.Update), f3, sid3)
					}
				},
			})
			if err1 != nil {
				return nil, err1
			}
		}
	}

	f, err := updateField(ctx, input, f1, s1.ID().Ref())
	if err != nil {
		return nil, err
	}

	return f, nil
}

func updateField(ctx context.Context, input gqlmodel.UpdateFieldInput, f *schema.Field, sid *id.SchemaID) (*gqlmodel.FieldPayload, error) {
	tp, dv, err := gqlmodel.FromSchemaTypeProperty(input.TypeProperty, gqlmodel.ToValueType(f.Type()), f.Multiple())
	if err != nil {
		return nil, err
	}

	ff, err := usecases(ctx).Schema.UpdateField(ctx, interfaces.UpdateFieldParam{
		SchemaId:     *sid,
		FieldId:      f.ID(),
		Name:         input.Title,
		Description:  input.Description,
		Key:          input.Key,
		Multiple:     input.Multiple,
		Order:        input.Order,
		Unique:       input.Unique,
		Required:     input.Required,
		IsTitle:      input.IsTitle,
		DefaultValue: dv,
		TypeProperty: tp,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.FieldPayload{
		Field: gqlmodel.ToSchemaField(ff),
	}, nil
}

func getFieldData(ctx context.Context, fid gqlmodel.ID, mid gqlmodel.ID) (*schema.Field, *model.Model, *schema.Schema, error) {
	fId, err := gqlmodel.ToID[id.Field](fid)
	if err != nil {
		return nil, nil, nil, err
	}

	mId, err := gqlmodel.ToID[id.Model](mid)
	if err != nil {
		return nil, nil, nil, err
	}

	ms, err := usecases(ctx).Model.FindByIDs(ctx, []id.ModelID{mId}, getOperator(ctx))
	if err != nil || len(ms) != 1 || ms[0].ID() != mId {
		if err == nil {
			return nil, nil, nil, rerror.NewE(i18n.T("not found"))
		}
		return nil, nil, nil, err
	}
	m := ms[0]

	s, err := usecases(ctx).Schema.FindByID(ctx, m.Schema(), getOperator(ctx))
	if err != nil {
		return nil, nil, nil, err
	}

	return s.Field(fId), m, s, nil
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

	fs, err := usecases(ctx).Schema.FindFieldByIDs(ctx, []id.FieldID{fId}, getOperator(ctx))
	if err != nil || len(fs) != 1 {
		return nil, err
	}
	f := fs[0]
	
	if f.Type() == value.TypeReference {
		var err1 error
		f.TypeProperty().Match(schema.TypePropertyMatch{
			Reference: func(fr *schema.FieldReference) {
				if fr.CorrespondingField() != nil {			
					ms, err := usecases(ctx).Model.FindByIDs(ctx, []id.ModelID{fr.Model()}, getOperator(ctx))
					if err != nil || len(ms) != 1 || ms[0].ID() != mId {
						if err == nil {
							err1 = rerror.NewE(i18n.T("not found"))
						}
						err1 = err
					}
					m := ms[0]
					
					cfId := *fr.CorrespondingField()
					fr.SetCorrespondingField(nil)

					_, err1 = usecases(ctx).Schema.UpdateField(ctx, interfaces.UpdateFieldParam{
						SchemaId:     m.Schema(),
						FieldId:      cfId,
						TypeProperty: fr.TypeProperty(),
					}, getOperator(ctx))
				}
			},
		})
		if err1 != nil {
			return nil, err1
		}
	}

	if err := usecases(ctx).Schema.DeleteField(ctx, m[0].Schema(), fId, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteFieldPayload{
		FieldID: input.FieldID,
	}, nil
}

func (r *mutationResolver) UpdateFields(ctx context.Context, input []*gqlmodel.UpdateFieldInput) (*gqlmodel.FieldsPayload, error) {
	mId, err := gqlmodel.ToID[id.Model](input[0].ModelID)
	if err != nil {
		return nil, err
	}

	ms, err := usecases(ctx).Model.FindByIDs(ctx, []id.ModelID{mId}, getOperator(ctx))
	if err != nil || len(ms) != 1 || ms[0].ID() != mId {
		if err == nil {
			return nil, rerror.NewE(i18n.T("not found"))
		}
		return nil, err
	}

	s, err := usecases(ctx).Schema.FindByID(ctx, ms[0].Schema(), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	if err != nil {
		return nil, err
	}
	params, err := util.TryMap(input, func(ipt *gqlmodel.UpdateFieldInput) (interfaces.UpdateFieldParam, error) {
		fid, err := gqlmodel.ToID[id.Field](ipt.FieldID)
		if err != nil {
			return interfaces.UpdateFieldParam{}, err
		}
		dbField := s.Field(fid)

		tp, dv, err := gqlmodel.FromSchemaTypeProperty(ipt.TypeProperty, gqlmodel.ToValueType(dbField.Type()), dbField.Multiple())
		if err != nil {
			return interfaces.UpdateFieldParam{}, err
		}
		return interfaces.UpdateFieldParam{
			SchemaId:     s.ID(),
			FieldId:      fid,
			Name:         ipt.Title,
			Description:  ipt.Description,
			Key:          ipt.Key,
			Multiple:     ipt.Multiple,
			Order:        ipt.Order,
			Unique:       ipt.Unique,
			Required:     ipt.Required,
			IsTitle:      ipt.IsTitle,
			DefaultValue: dv,
			TypeProperty: tp,
		}, nil
	})
	if err != nil {
		return nil, err
	}

	fl, err := usecases(ctx).Schema.UpdateFields(ctx, ms[0].Schema(), params, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.FieldsPayload{
		Fields: lo.Map(fl, func(sf *schema.Field, _ int) *gqlmodel.SchemaField {
			return gqlmodel.ToSchemaField(sf)
		}),
	}, nil
}

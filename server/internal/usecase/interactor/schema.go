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
	"github.com/reearth/reearthx/util"
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
	s, err := i.repos.Schema.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return Run1(ctx, operator, i.repos, Usecase().WithReadableWorkspaces(s.Workspace()).Transaction(),
		func() (*schema.Schema, error) {
			return s, nil
		})
}

func (i Schema) FindByIDs(ctx context.Context, ids []id.SchemaID, operator *usecase.Operator) (schema.List, error) {
	ss, err := i.repos.Schema.FindByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}
	wIDs := util.Map(ss, func(s *schema.Schema) id.WorkspaceID { return s.Workspace() })
	return Run1(ctx, operator, i.repos, Usecase().WithReadableWorkspaces(wIDs...).Transaction(),
		func() (schema.List, error) {
			return ss, err
		})
}

func (i Schema) CreateField(ctx context.Context, param interfaces.CreateFieldParam, operator *usecase.Operator) (*schema.Field, error) {
	s, err := i.repos.Schema.FindByID(ctx, param.SchemaId)
	if err != nil {
		return nil, err
	}
	return Run1(ctx, operator, i.repos, Usecase().WithMaintainableWorkspaces(s.Workspace()).Transaction(),
		func() (*schema.Field, error) {
			var fb *schema.FieldBuilder

			param.TypeProperty.Match(schema.TypePropertyMatch{
				Text: func(fp *schema.FieldText) {
					fb = schema.NewFieldText(fp.DefaultValue(), fp.MaxLength())
				},
				TextArea: func(fp *schema.FieldTextArea) {
					fb = schema.NewFieldTextArea(fp.DefaultValue(), fp.MaxLength())
				},
				RichText: func(fp *schema.FieldRichText) {
					fb = schema.NewFieldRichText(fp.DefaultValue(), fp.MaxLength())
				},
				Markdown: func(fp *schema.FieldMarkdown) {
					fb = schema.NewFieldMarkdown(fp.DefaultValue(), fp.MaxLength())
				},
				Asset: func(fp *schema.FieldAsset) {
					fb = schema.NewFieldAsset(fp.DefaultValue())
				},
				Date: func(fp *schema.FieldDate) {
					fb = schema.NewFieldDate(fp.DefaultValue())
				},
				Bool: func(fp *schema.FieldBool) {
					fb = schema.NewFieldBool(fp.DefaultValue())
				},
				Select: func(fp *schema.FieldSelect) {
					fb = schema.NewFieldSelect(fp.Values(), fp.DefaultValue())
				},
				Integer: func(fp *schema.FieldInteger) {
					fb = schema.NewFieldInteger(fp.DefaultValue(), fp.Min(), fp.Max())
				},
				Reference: func(fp *schema.FieldReference) {
					fb = schema.NewFieldReference(fp.ModelID())
				},
				URL: func(fp *schema.FieldURL) {
					fb = schema.NewFieldURL(fp.DefaultValue())
				},
				Default: func() {
					fb = nil
				},
			})
			if fb == nil {
				return nil, interfaces.ErrInvalidTypeProperty
			}

			if s.HasFieldByKey(*param.Key) {
				return nil, interfaces.ErrInvalidKey
			}
			f, err := fb.NewID().
				Options(param.Unique, param.MultiValue, param.Required).
				Name(*param.Name).
				Description(*param.Description).
				Key(key.New(*param.Key)).
				Options(param.Unique, param.MultiValue, param.Required).
				Build()
			if err != nil {
				return nil, err
			}

			s.AddField(*f)

			if err := i.repos.Schema.Save(ctx, s); err != nil {
				return nil, err
			}

			return f, nil
		})
}

func (i Schema) UpdateField(ctx context.Context, param interfaces.UpdateFieldParam, operator *usecase.Operator) (*schema.Field, error) {
	s, err := i.repos.Schema.FindByID(ctx, param.SchemaId)
	if err != nil {
		return nil, err
	}
	return Run1(ctx, operator, i.repos, Usecase().WithMaintainableWorkspaces(s.Workspace()).Transaction(),
		func() (*schema.Field, error) {
			f := s.Field(param.FieldId)
			if f == nil {
				return nil, interfaces.ErrFieldNotFound
			}

			f.SetTypeProperty(&param.TypeProperty)

			if param.Name != nil {
				f.SetName(*param.Name)
			}
			if param.Description != nil {
				f.SetDescription(*param.Description)
			}
			if param.Key != nil {
				k := key.New(*param.Key)
				if !k.IsValid() {
					return nil, interfaces.ErrInvalidKey
				}
				f.SetKey(k)
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
	s, err := i.repos.Schema.FindByID(ctx, schemaId)
	if err != nil {
		return err
	}
	return Run0(ctx, operator, i.repos, Usecase().WithMaintainableWorkspaces(s.Workspace()).Transaction(),
		func() error {
			s.RemoveField(fieldID)
			return i.repos.Schema.Save(ctx, s)
		})
}

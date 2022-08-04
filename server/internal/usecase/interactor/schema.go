package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/util"
	"github.com/samber/lo"
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
	return Run1(ctx, operator, i.repos, Usecase().WithWritableWorkspaces(s.Workspace()).Transaction(),
		func() (*schema.Field, error) {
			f, err := schema.NewFieldText(lo.ToPtr(""), lo.ToPtr(65)).
				NewID().
				Options(param.Unique, param.MultiValue, param.Required).
				Name(*param.Name).
				Description(*param.Description).
				Key(key.New(*param.Key)).
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
	// TODO implement me
	panic("implement me")
}

func (i Schema) DeleteField(ctx context.Context, fieldID id.FieldID, operator *usecase.Operator) error {
	// TODO implement me
	panic("implement me")
}

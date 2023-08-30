package gql

import (
	"context"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

func (r *Resolver) Model() ModelResolver {
	return &modelResolver{r}
}

type modelResolver struct{ *Resolver }

func (m modelResolver) MetadataSchema(ctx context.Context, obj *gqlmodel.Model) (*gqlmodel.Schema, error) {
	if obj.MetadataSchemaID != nil {
		return dataloaders(ctx).Schema.Load(obj.MetadataSchema.ID)
	}
	mId, err := gqlmodel.ToID[id.Model](obj.ID)
	if err != nil {
		return nil, err
	}
	ms, err := usecases(ctx).Model.CreateMetadata(ctx, mId, getOperator(ctx))
	if err != nil {
		return nil, err
	}
	return dataloaders(ctx).Schema.Load(gqlmodel.IDFrom(*ms.Metadata()))
}

func (m modelResolver) Project(ctx context.Context, obj *gqlmodel.Model) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

func (m modelResolver) Schema(ctx context.Context, obj *gqlmodel.Model) (*gqlmodel.Schema, error) {
	return dataloaders(ctx).Schema.Load(obj.SchemaID)
}

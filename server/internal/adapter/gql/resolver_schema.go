package gql

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.76

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/samber/lo"
)

// TitleField is the resolver for the titleField field.
func (r *schemaResolver) TitleField(ctx context.Context, obj *gqlmodel.Schema) (*gqlmodel.SchemaField, error) {
	if obj.TitleFieldID == nil {
		return nil, nil
	}
	ss, err := dataloaders(ctx).Schema.Load(obj.ID)
	if err != nil {
		return nil, err
	}
	ff, ok := lo.Find(ss.Fields, func(f *gqlmodel.SchemaField) bool {
		return f.ID == *obj.TitleFieldID
	})
	if !ok {
		return nil, nil
	}
	return ff, nil
}

// Project is the resolver for the project field.
func (r *schemaResolver) Project(ctx context.Context, obj *gqlmodel.Schema) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

// Schema returns SchemaResolver implementation.
func (r *Resolver) Schema() SchemaResolver { return &schemaResolver{r} }

type schemaResolver struct{ *Resolver }

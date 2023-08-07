package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) SchemaFieldReference() SchemaFieldReferenceResolver {
	return &schemaFieldReferenceResolver{r}
}

type schemaFieldReferenceResolver struct{ *Resolver }

func (s schemaFieldReferenceResolver) CorrespondingField(ctx context.Context, obj *gqlmodel.SchemaFieldReference) (*gqlmodel.SchemaField, error) {
	return dataloaders(ctx).SchemaField.Load(*obj.CorrespondingFieldID)
}

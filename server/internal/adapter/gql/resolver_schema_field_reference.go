package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/samber/lo"
)

func (r *Resolver) SchemaFieldReference() SchemaFieldReferenceResolver {
	return &schemaFieldReferenceResolver{r}
}

type schemaFieldReferenceResolver struct{ *Resolver }

func (s schemaFieldReferenceResolver) CorrespondingField(ctx context.Context, obj *gqlmodel.SchemaFieldReference) (*gqlmodel.SchemaField, error) {
	if obj.CorrespondingFieldID == nil {
		return nil, nil
	}

	return dataloaders(ctx).SchemaField.Load(lo.FromPtr(obj.CorrespondingFieldID))
}

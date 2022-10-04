package gql

import (
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

type ThreadDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Thread, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Thread, []error)
}

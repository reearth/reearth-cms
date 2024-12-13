package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

type Schema interface {
	FindByID(context.Context, id.SchemaID) (*interface{}, error)
	Save(context.Context, *interface{}) error
}

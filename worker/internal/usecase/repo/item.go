package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

type Item interface {
	FindBySchema(context.Context, id.SchemaID) ([]interface{}, error)
	SaveAll(context.Context, []interface{}) error
}

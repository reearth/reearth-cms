package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

type Model interface {
	FindByID(context.Context, id.ModelID) (*interface{}, error)
}

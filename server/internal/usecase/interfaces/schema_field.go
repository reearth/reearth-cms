package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

type SchemaField interface {
	// FindByID(context.Context, id.FieldID, *usecase.Operator) (*schema.Field, error)
	FindByIDs(context.Context, []id.FieldID, *usecase.Operator) ([]*schema.Field, error)
}

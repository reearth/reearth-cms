package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

type CreateFieldParam struct {
	SchemaId     id.SchemaID
	Type         schema.Type
	Name         *string
	Description  *string
	Key          *string
	MultiValue   bool
	Unique       bool
	Required     bool
	TypeProperty schema.TypeProperty
}

type UpdateFieldParam struct {
	FieldId      id.FieldID
	Name         *string
	Description  *string
	Key          *string
	TypeProperty schema.TypeProperty
}

var (
// Err1 error = errors.New("")
)

type Schema interface {
	FindByIDs(context.Context, []id.SchemaID, *usecase.Operator) (schema.List, error)
	CreateField(context.Context, CreateFieldParam, *usecase.Operator) (*schema.Field, error)
	UpdateField(context.Context, UpdateFieldParam, *usecase.Operator) (*schema.Field, error)
	DeleteField(context.Context, id.FieldID, *usecase.Operator) error
}

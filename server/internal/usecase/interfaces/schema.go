package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type CreateFieldParam struct {
	SchemaId     id.SchemaID
	Type         value.Type
	Name         *string
	Description  *string
	Key          string
	MultiValue   bool
	Unique       bool
	Required     bool
	TypeProperty *schema.TypeProperty
	DefaultValue *value.Value
}

type UpdateFieldParam struct {
	SchemaId     id.SchemaID
	FieldId      id.FieldID
	Name         *string
	Description  *string
	Key          *string
	MultiValue   *bool
	Unique       *bool
	Required     *bool
	TypeProperty *schema.TypeProperty
	DefaultValue *value.Value
}

var (
	ErrInvalidTypeProperty error = errors.New("invalid type property")
	ErrFieldNotFound       error = errors.New("field not found")
	ErrInvalidKey          error = errors.New("invalid key")
)

type Schema interface {
	FindByID(context.Context, id.SchemaID, *usecase.Operator) (*schema.Schema, error)
	FindByIDs(context.Context, []id.SchemaID, *usecase.Operator) (schema.List, error)
	// Create(context.Context, id.WorkspaceID, *usecase.Operator) (*schema.Schema, error)
	CreateField(context.Context, CreateFieldParam, *usecase.Operator) (*schema.Field, error)
	UpdateField(context.Context, UpdateFieldParam, *usecase.Operator) (*schema.Field, error)
	DeleteField(context.Context, id.SchemaID, id.FieldID, *usecase.Operator) error
}

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
	Name         string
	Description  *string
	Key          string
	Multiple     bool
	Unique       bool
	Required     bool
	TypeProperty *schema.TypeProperty
	DefaultValue *value.Multiple
}

type UpdateFieldParam struct {
	SchemaId     id.SchemaID
	FieldId      id.FieldID
	Name         *string
	Description  *string
	Order        *int
	Key          *string
	Multiple     *bool
	Unique       *bool
	Required     *bool
	TypeProperty *schema.TypeProperty
	DefaultValue *value.Multiple
}

var (
	ErrInvalidTypeProperty = errors.New("invalid type property")
	ErrFieldNotFound       = errors.New("field not found")
	ErrInvalidKey          = errors.New("invalid key")
	ErrInvalidValue        = errors.New("invalid value")
)

type Schema interface {
	FindByID(context.Context, id.SchemaID, *usecase.Operator) (*schema.Schema, error)
	FindByIDs(context.Context, []id.SchemaID, *usecase.Operator) (schema.List, error)
	CreateField(context.Context, CreateFieldParam, *usecase.Operator) (*schema.Field, error)
	UpdateField(context.Context, UpdateFieldParam, *usecase.Operator) (*schema.Field, error)
	DeleteField(context.Context, id.SchemaID, id.FieldID, *usecase.Operator) error
}

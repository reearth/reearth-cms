package model

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/model"
)

type Field interface {
	Id() ID
	ModelID() model.ID
	Type() Type
	Name() string
	Description() string
	Key() string
	CreatedAt() time.Time
	UpdatedAt() time.Time
}

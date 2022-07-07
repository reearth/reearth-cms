package model

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/model"
)

type TextField struct {
	id          ID
	modelID     model.ID
	fieldType   Type
	name        string
	description string
	key         string
	updatedAt   time.Time

	defaultValue string
	maxLength    int
}

func (t TextField) Id() ID {
	panic("implement me")
}

func (t TextField) ModelID() model.ID {
	panic("implement me")
}

func (t TextField) Type() Type {
	panic("implement me")
}

func (t TextField) Name() string {
	panic("implement me")
}

func (t TextField) Description() string {
	panic("implement me")
}

func (t TextField) Key() string {
	panic("implement me")
}

func (t TextField) CreatedAt() time.Time {
	panic("implement me")
}

func (t TextField) UpdatedAt() time.Time {
	panic("implement me")
}

package schema

import (
	"time"
)

type Field struct {
	id           ID
	name         string
	description  string
	key          string
	createdAt    time.Time
	updatedAt    time.Time
	typeProperty TypeProperty
}

func (f *Field) Type() Type {
	return f.typeProperty.Type()
}

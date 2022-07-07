package model

import (
	"errors"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

var (
	ErrInvalidKey = errors.New("invalid key")
)

type Model struct {
	id          ID
	project     id.ProjectID
	name        string
	description string
	key         Key
	public      bool
	updatedAt   time.Time
	// schema      id.SchemaID
}

func (p *Model) ID() ID {
	return p.id
}

func (p *Model) SetID(id ID) {
	p.id = id
}

func (p *Model) Project() id.ProjectID {
	return p.project
}

func (p *Model) SetProject(project id.ProjectID) {
	p.project = project
}

func (p *Model) Name() string {
	return p.name
}

func (p *Model) SetName(name string) {
	p.name = name
}

func (p *Model) Description() string {
	return p.description
}

func (p *Model) SetDescription(description string) {
	p.description = description
}

func (p *Model) Key() Key {
	return p.key
}

func (p *Model) SetKey(key Key) error {
	if !key.IsValid() {
		return ErrInvalidKey
	}
	p.key = key
	return nil
}

func (p *Model) IsPublic() bool {
	return p.public
}

func (p *Model) SetIsPublic(public bool) {
	p.public = public
}

func (p *Model) UpdatedAt() time.Time {
	return p.updatedAt
}

func (p *Model) SetUpdatedAt(updatedAt time.Time) {
	p.updatedAt = updatedAt
}

func (p *Model) CreatedAt() time.Time {
	return p.id.Timestamp()
}

func CheckKeyPattern(key string) bool {
	return key != "" && keyRegexp.Match([]byte(key))
}

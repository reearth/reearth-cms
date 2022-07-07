package model

import (
	"errors"
	"regexp"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

var (
	ErrInvalidKey = errors.New("invalid key")
	keyRegexp     = regexp.MustCompile("^[a-zA-Z0-9_-]{5,32}$")
)

type Model struct {
	id          ID
	project     id.ProjectID
	name        string
	description string
	key         string
	isPublic    bool
	updatedAt   time.Time
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

func (p *Model) Key() string {
	return p.key
}

func (p *Model) SetKey(key string) error {
	if CheckKeyPattern(key) {
		p.key = key
	} else {
		return ErrInvalidKey
	}
	return nil
}

func (p *Model) IsPublic() bool {
	return p.isPublic
}

func (p *Model) SetIsPublic(isPublic bool) {
	p.isPublic = isPublic
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

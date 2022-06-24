package project

import (
	"errors"
	"net/url"
	"regexp"
	"time"
)

var (
	ErrInvalidAlias error = errors.New("invalid alias")
	aliasRegexp           = regexp.MustCompile("^[a-zA-Z0-9_-]{5,32}$")
)

type Project struct {
	id          ID
	workspaceID WorkspaceID
	name        string
	description string
	alias       string
	imageURL    *url.URL
	updatedAt   time.Time
}

func (p *Project) ID() ID {
	return p.id
}

func (p *Project) UpdatedAt() time.Time {
	return p.updatedAt
}

func (p *Project) Name() string {
	return p.name
}

func (p *Project) Description() string {
	return p.description
}

func (p *Project) Alias() string {
	return p.alias
}

func (p *Project) ImageURL() *url.URL {
	if p == nil || p.imageURL == nil {
		return nil
	}
	// https://github.com/golang/go/issues/38351
	imageURL2 := *p.imageURL
	return &imageURL2
}

func (p *Project) Workspace() WorkspaceID {
	return p.workspaceID
}

func (p *Project) CreatedAt() time.Time {
	return p.id.Timestamp()
}

func (p *Project) SetUpdatedAt(updatedAt time.Time) {
	p.updatedAt = updatedAt
}

func (p *Project) SetImageURL(imageURL *url.URL) {
	if imageURL == nil {
		p.imageURL = nil
	} else {
		// https://github.com/golang/go/issues/38351
		imageURL2 := *imageURL
		p.imageURL = &imageURL2
	}
}

func (p *Project) UpdateName(name string) {
	p.name = name
}

func (p *Project) UpdateDescription(description string) {
	p.description = description
}

func (p *Project) UpdateAlias(alias string) error {
	if CheckAliasPattern(alias) {
		p.alias = alias
	} else {
		return ErrInvalidAlias
	}
	return nil
}

func (p *Project) UpdateTeam(team WorkspaceID) {
	p.workspaceID = team
}

func CheckAliasPattern(alias string) bool {
	return alias != "" && aliasRegexp.Match([]byte(alias))
}

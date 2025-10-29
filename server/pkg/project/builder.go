package project

import (
	"net/url"
	"time"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"golang.org/x/exp/slices"
)

type Builder struct {
	p *Project
	a *Accessibility
}

func New() *Builder {
	return &Builder{p: &Project{}}
}

func (b *Builder) Build() (*Project, error) {
	if b.p.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.p.alias != "" && !CheckAliasPattern(b.p.alias) {
		return nil, ErrInvalidAlias
	}
	if b.p.updatedAt.IsZero() {
		b.p.updatedAt = b.p.CreatedAt()
	}

	// by default project is public
	if b.a == nil {
		b.a = NewPublicAccessibility()
	}
	b.p.accessibility = b.a

	return b.p, nil
}

func (b *Builder) MustBuild() *Project {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id ID) *Builder {
	b.p.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.p.id = NewID()
	return b
}

func (b *Builder) UpdatedAt(updatedAt time.Time) *Builder {
	b.p.updatedAt = updatedAt
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.p.name = name
	return b
}

func (b *Builder) Description(description string) *Builder {
	b.p.description = description
	return b
}

func (b *Builder) Readme(readme string) *Builder {
	b.p.readme = readme
	return b
}

func (b *Builder) License(license string) *Builder {
	b.p.license = license
	return b
}

func (b *Builder) Alias(alias string) *Builder {
	b.p.alias = alias
	return b
}

func (b *Builder) ImageURL(imageURL *url.URL) *Builder {
	if imageURL == nil {
		b.p.imageURL = nil
	} else {
		// https://github.com/golang/go/issues/38351
		imageURL2 := *imageURL
		b.p.imageURL = &imageURL2
	}
	return b
}

func (b *Builder) Workspace(team accountdomain.WorkspaceID) *Builder {
	b.p.workspaceID = team
	return b
}

func (b *Builder) Accessibility(accessibility *Accessibility) *Builder {
	b.a = accessibility
	return b
}

func (b *Builder) RequestRoles(requestRoles []workspace.Role) *Builder {
	b.p.requestRoles = slices.Clone(requestRoles)
	return b
}

func (b *Builder) StarCount(starCount int64) *Builder {
	b.p.starCount = starCount
	return b
}

func (b *Builder) StarredBy(starredBy []string) *Builder {
	b.p.starredBy = slices.Clone(starredBy)
	return b
}

func (b *Builder) Topics(topics []string) *Builder {
	if topics == nil {
		b.p.topics = nil
		return b
	}
	uniqueTopics := make([]string, 0, len(topics))
	topicSet := make(map[string]struct{})
	for _, t := range topics {
		if t == "" {
			continue // skip empty values
		}
		if _, exists := topicSet[t]; exists {
			continue // skip duplicates
		}
		topicSet[t] = struct{}{}
		uniqueTopics = append(uniqueTopics, t)
	}
	b.p.topics = uniqueTopics
	return b
}

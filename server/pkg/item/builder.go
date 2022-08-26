package item

import "time"

type Builder struct {
	i *Item
}

func New() *Builder {
	return &Builder{i: &Item{}}
}

func (b *Builder) Build() (*Item, error) {
	if b.i.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.i.updatedAt.IsZero() {
		b.i.updatedAt = b.i.CreatedAt()
	}
	return b.i, nil
}

func (b *Builder) ID(id ID) *Builder {
	b.i.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.i.id = NewID()
	return b
}

func (b *Builder) Model(modelId ModelID) *Builder {
	b.i.modelId = modelId
	return b
}

func (b *Builder) UpdatedAt(updatedAt time.Time) *Builder {
	b.i.updatedAt = updatedAt
	return b
}

func (b *Builder) PublicVersion(publicVersion string) *Builder {
	b.i.publicVersion = publicVersion
	return b
}

func (b *Builder) LatestVersion(latestVersion *Version) *Builder {
	b.i.latestVersion = latestVersion
	return b
}

func (b *Builder) Versions(versions []*Version) *Builder {
	b.i.versions = versions
	return b
}

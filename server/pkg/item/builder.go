package item

import "time"

type Builder struct {
	i *Item
}

func New() *Builder {
	return &Builder{i: &Item{}}
}

func (b *Builder) ID(id ID) {
	b.i.id = id
}

func (b *Builder) ModelID(modelId ModelID) {
	b.i.modelId = modelId
}

func (b *Builder) CreatedAt(createdAt time.Time) {
	b.i.createdAt = createdAt
}

func (b *Builder) UpdatedAt(updatedAt time.Time) {
	b.i.updatedAt = updatedAt
}

func (b *Builder) PublicVersion(publicVersion string) {
	b.i.publicVersion = publicVersion
}

func (b *Builder) LatestVersion(latestVersion Version) {
	b.i.latestVersion = latestVersion
}

func (b *Builder) Versions(versions []Version) {
	b.i.versions = versions
}

package item

import "time"

type Item struct {
	id            ID
	modelId       ModelID
	createdAt     time.Time
	updatedAt     time.Time
	publicVersion string
	latestVersion *Version
	versions      []*Version
}

func (i *Item) ID() ID {
	return i.id
}

func (i *Item) ModelId() ModelID {
	return i.modelId
}

func (i *Item) CreatedAt() time.Time {
	return i.createdAt
}

func (i *Item) UpdatedAt() time.Time {
	return i.updatedAt
}

func (i *Item) PublicVersion() string {
	return i.publicVersion
}

func (i *Item) LatestVersion() *Version {
	return i.latestVersion
}

func (i *Item) Versions() []*Version {
	return i.versions
}

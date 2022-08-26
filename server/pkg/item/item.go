package item

import "time"

type Item struct {
	id            ID
	modelId       ModelID
	updatedAt     time.Time
	publicVersion string
	latestVersion *Version
	versions      []*Version
}

func (i *Item) ID() ID {
	return i.id
}

func (i *Item) Model() ModelID {
	return i.modelId
}

func (i *Item) CreatedAt() time.Time {
	return i.id.Timestamp()
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

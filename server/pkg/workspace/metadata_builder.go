package workspace

import (
	"github.com/samber/lo"
)

type MetadataBuilder struct {
	m Metadata
}

func NewMetadata() *MetadataBuilder {
	return &MetadataBuilder{m: Metadata{}}
}

func (b *MetadataBuilder) Build() (Metadata, error) {
	return b.m, nil
}

func (b *MetadataBuilder) MustBuild() Metadata {
	return lo.Must(b.Build())
}

func (b *MetadataBuilder) Description(description string) *MetadataBuilder {
	b.m.description = description
	return b
}

func (b *MetadataBuilder) Website(website string) *MetadataBuilder {
	b.m.website = website
	return b
}

func (b *MetadataBuilder) Location(location string) *MetadataBuilder {
	b.m.location = location
	return b
}

func (b *MetadataBuilder) BillingEmail(billingEmail string) *MetadataBuilder {
	b.m.billingEmail = billingEmail
	return b
}

func (b *MetadataBuilder) PhotoURL(photoURL string) *MetadataBuilder {
	b.m.photoURL = photoURL
	return b
}

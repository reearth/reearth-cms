package project

type APIKeyBuilder struct {
	at *APIKey
}

func NewAPIKeyBuilder() *APIKeyBuilder {
	return &APIKeyBuilder{at: &APIKey{}}
}

func (b *APIKeyBuilder) ID(id APIKeyID) *APIKeyBuilder {
	b.at.id = id
	return b
}

func (b *APIKeyBuilder) NewID() *APIKeyBuilder {
	b.at.id = NewAPIKeyID()
	return b
}

func (b *APIKeyBuilder) Name(name string) *APIKeyBuilder {
	b.at.name = name
	return b
}

func (b *APIKeyBuilder) Description(desc string) *APIKeyBuilder {
	b.at.desc = desc
	return b
}

func (b *APIKeyBuilder) Key(key string) *APIKeyBuilder {
	b.at.key = key
	return b
}

func (b *APIKeyBuilder) GenerateKey() *APIKeyBuilder {
	b.at.GenerateKey()
	return b
}

func (b *APIKeyBuilder) Publication(publication *PublicationSettings) *APIKeyBuilder {
	if b.at == nil {
		return b
	}
	if publication == nil {
		b.at.publication = nil
		return b
	}
	b.at.publication = publication.Clone()
	return b
}

func (b *APIKeyBuilder) Build() *APIKey {
	if b.at == nil {
		return nil
	}
	return b.at.Clone()
}

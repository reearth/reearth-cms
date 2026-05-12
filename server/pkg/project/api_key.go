package project

import "github.com/samber/lo"

const charSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

type APIKey struct {
	id          APIKeyID
	name        string
	desc        string
	key         string
	publication *PublicationSettings
}

type APIKeys []*APIKey

func (a *APIKey) ID() APIKeyID {
	return a.id
}

func (a *APIKey) Name() string {
	return a.name
}

func (a *APIKey) Description() string {
	return a.desc
}

func (a *APIKey) Key() string {
	return a.key
}

func (a *APIKey) Publication() *PublicationSettings {
	if a == nil || a.publication == nil {
		return nil
	}
	return a.publication.Clone()
}

func (a *APIKey) SetName(name string) {
	a.name = name
}

func (a *APIKey) SetDescription(desc string) {
	a.desc = desc
}

func (a *APIKey) SetKey(key string) {
	a.key = key
}

func (a *APIKey) SetPublication(publication PublicationSettings) {
	if a == nil {
		return
	}
	a.publication = publication.Clone()
}

func (a *APIKey) GenerateKey() {
	a.key = "secret_" + lo.RandomString(43, []rune(charSet))
}

func (a *APIKey) Clone() *APIKey {
	return &APIKey{
		id:          a.id,
		name:        a.name,
		desc:        a.desc,
		key:         a.key,
		publication: a.publication.Clone(),
	}
}

func (a APIKeys) Clone() APIKeys {
	if a == nil {
		return nil
	}
	return lo.Map(a, func(at *APIKey, _ int) *APIKey {
		return at.Clone()
	})
}

func (a APIKeys) Contains(id APIKeyID) bool {
	if a == nil {
		return false
	}
	return lo.ContainsBy(a, func(at *APIKey) bool { return at.ID() == id })
}

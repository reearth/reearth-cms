package project

import "github.com/reearth/reearth-cms/server/pkg/id"

type Accessibility struct {
	visibility  Visibility
	publication *PublicationSettings
	apiKeys     APIKeys
}

func NewAccessibility(visibility Visibility, publication *PublicationSettings, keys APIKeys) *Accessibility {
	p := &Accessibility{
		publication: publication.Clone(),
		apiKeys:     keys.Clone(),
	}
	p.SetVisibility(visibility)
	return p
}

func NewPublicAccessibility() *Accessibility {
	return &Accessibility{
		visibility:  VisibilityPublic,
		publication: nil,
		apiKeys:     nil,
	}
}

func NewPrivateAccessibility(publication PublicationSettings, keys APIKeys) *Accessibility {
	return &Accessibility{
		visibility:  VisibilityPrivate,
		publication: publication.Clone(),
		apiKeys:     keys.Clone(),
	}
}

func (p *Accessibility) Visibility() Visibility {
	if p == nil || p.visibility == "" {
		return VisibilityPublic
	}
	return p.visibility
}

func (p *Accessibility) ApiKeys() APIKeys {
	if p == nil || p.apiKeys == nil {
		return nil
	}
	return p.apiKeys.Clone()
}

func (p *Accessibility) Publication() *PublicationSettings {
	if p == nil || p.publication == nil {
		return nil
	}
	return p.publication.Clone()
}

func (p *Accessibility) SetVisibility(visibility Visibility) {
	if visibility != VisibilityPrivate && visibility != VisibilityPublic {
		visibility = VisibilityPublic
	}
	p.visibility = visibility
}

func (p *Accessibility) SetPublication(publication *PublicationSettings) {
	if p == nil {
		return
	}
	if publication == nil {
		p.publication = nil
		return
	}
	p.publication = publication.Clone()
}

func (p *Accessibility) SetAPIKeys(keys APIKeys) {
	if p == nil {
		return
	}
	if keys == nil {
		p.apiKeys = nil
		return
	}
	p.apiKeys = keys.Clone()
}

func (p *Accessibility) APIKeyById(id APIKeyID) *APIKey {
	if p == nil || p.apiKeys == nil {
		return nil
	}
	for _, apiKey := range p.apiKeys {
		if apiKey.ID() == id {
			return apiKey.Clone()
		}
	}
	return nil
}

func (p *Accessibility) APIKeyByKey(key string) *APIKey {
	if p == nil || p.apiKeys == nil {
		return nil
	}
	for _, apiKey := range p.apiKeys {
		if apiKey.Key() == key {
			return apiKey.Clone()
		}
	}
	return nil
}

func (p *Accessibility) AddAPIKey(key APIKey) {
	if p == nil {
		return
	}
	if key.ID().IsEmpty() {
		key.id = NewAPIKeyID()
	}
	if p.apiKeys.Contains(key.ID()) {
		p.UpdateAPIKey(key)
	}
	p.apiKeys = append(p.apiKeys, key.Clone())
}

func (p *Accessibility) RemoveAPIKey(id APIKeyID) {
	if p == nil || p.apiKeys == nil {
		return
	}
	for i, key := range p.apiKeys {
		if key.ID() == id {
			p.apiKeys = append(p.apiKeys[:i], p.apiKeys[i+1:]...)
			return
		}
	}
}

func (p *Accessibility) UpdateAPIKey(key APIKey) {
	if p == nil || p.apiKeys == nil {
		return
	}
	for i, t := range p.apiKeys {
		if t.ID() == key.ID() {
			p.apiKeys[i] = key.Clone()
			return
		}
	}
}

func (p *Accessibility) Clone() *Accessibility {
	if p == nil {
		return nil
	}
	return &Accessibility{
		visibility:  p.visibility,
		publication: p.publication.Clone(),
		apiKeys:     p.apiKeys.Clone(),
	}
}

func (p *Accessibility) IsAssetsPublic(keyId *APIKeyID) bool {
	if p == nil || p.publication == nil {
		return true
	}
	if p.visibility == VisibilityPublic {
		return true
	}
	if p.publication.PublicAssets() {
		return true
	}
	if keyId != nil && p.APIKeyById(*keyId) != nil && p.APIKeyById(*keyId).Publication().PublicAssets() {
		return true
	}
	return false
}

func (p *Accessibility) IsModelPublic(modelID id.ModelID, keyId *APIKeyID) bool {
	if p == nil || p.publication == nil {
		return true
	}
	if p.visibility == VisibilityPublic {
		return true
	}
	if p.publication.PublicModels().Has(modelID) {
		return true
	}
	if keyId != nil && p.APIKeyById(*keyId) != nil && p.APIKeyById(*keyId).Publication().PublicModels().Has(modelID) {
		return true
	}
	return false
}

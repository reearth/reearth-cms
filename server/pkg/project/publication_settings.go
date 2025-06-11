package project

type PublicationSettings struct {
	publicModels ModelIDList
	publicAssets bool
}

func NewPublicationSettings(publicModels ModelIDList, publicAssets bool) *PublicationSettings {
	return &PublicationSettings{
		publicModels: publicModels.Clone(),
		publicAssets: publicAssets,
	}
}

func (p *PublicationSettings) PublicModels() ModelIDList {
	if p == nil || p.publicModels == nil {
		return nil
	}
	return p.publicModels.Clone()
}

func (p *PublicationSettings) PublicAssets() bool {
	if p == nil {
		return true
	}
	return p.publicAssets
}

func (p *PublicationSettings) Clone() *PublicationSettings {
	if p == nil {
		return nil
	}
	return &PublicationSettings{
		publicModels: p.publicModels.Clone(),
		publicAssets: p.publicAssets,
	}
}

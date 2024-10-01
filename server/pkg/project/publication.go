package project

import "github.com/reearth/reearth-cms/server/pkg/token"

const (
	PublicationScopePrivate PublicationScope = "private"
	PublicationScopeLimited PublicationScope = "limited"
	PublicationScopePublic  PublicationScope = "public"
)

type PublicationScope string

type Publication struct {
	scope       PublicationScope
	assetPublic bool
	token       string
}

func NewPublication(scope PublicationScope, assetPublic bool) *Publication {
	p := &Publication{}
	p.SetScope(scope)
	p.SetAssetPublic(assetPublic)
	p.GenerateToken()
	return p
}

func NewPublicationWithToken(scope PublicationScope, assetPublic bool, token string) *Publication {
	p := &Publication{}
	p.SetScope(scope)
	p.SetAssetPublic(assetPublic)
	p.SetToken(token)
	return p
}

func (p *Publication) Scope() PublicationScope {
	if p.scope == "" {
		return PublicationScopePrivate
	}
	return p.scope
}

func (p *Publication) AssetPublic() bool {
	return p.assetPublic
}

func (p *Publication) Token() string {
	return p.token
}

func (p *Publication) SetToken(t string) {
	p.token = t
}

func (p *Publication) GenerateToken() {
	p.token = token.Random()
}

func (p *Publication) SetScope(scope PublicationScope) {
	if scope != PublicationScopePrivate && scope != PublicationScopeLimited && scope != PublicationScopePublic {
		scope = PublicationScopePrivate
	}
	if scope == PublicationScopeLimited {
		p.GenerateToken()
	}

	p.scope = scope
}

func (p *Publication) SetAssetPublic(assetPublic bool) {
	p.assetPublic = assetPublic
}

func (p *Publication) Clone() *Publication {
	if p == nil {
		return nil
	}

	return &Publication{
		scope:       p.scope,
		assetPublic: p.assetPublic,
		token:       p.token,
	}
}

package project

import (
	"github.com/samber/lo"
)

const (
	PublicationScopePrivate PublicationScope = "private"
	PublicationScopeLimited PublicationScope = "limited"
	PublicationScopePublic  PublicationScope = "public"
)

const charSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

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
	return p
}

func NewPublicationWithToken(scope PublicationScope, assetPublic bool, token string) *Publication {
	p := &Publication{
		token: token,
	}
	p.SetScope(scope)
	p.SetAssetPublic(assetPublic)
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

func (p *Publication) GenerateToken() {
	p.token = "secret_" + lo.RandomString(43, []rune(charSet))
}

func (p *Publication) SetScope(scope PublicationScope) {
	if scope != PublicationScopePrivate && scope != PublicationScopeLimited && scope != PublicationScopePublic {
		scope = PublicationScopePrivate
	}
	if scope == PublicationScopeLimited && p.token == "" {
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

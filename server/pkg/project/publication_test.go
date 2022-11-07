package project

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewPublication(t *testing.T) {
	assert.Equal(t, &Publication{
		scope:       PublicationScopePrivate,
		assetPublic: false,
		token:       "token",
	}, NewPublication(PublicationScopePrivate, false, "token"))
	assert.Equal(t, &Publication{
		scope:       PublicationScopeLimited,
		assetPublic: true,
		token:       "token",
	}, NewPublication(PublicationScopeLimited, true, "token"))
	assert.Equal(t, &Publication{
		scope:       PublicationScopePublic,
		assetPublic: false,
		token:       "token",
	}, NewPublication(PublicationScopePublic, false, "token"))
	assert.Equal(t, &Publication{
		scope:       PublicationScopePrivate,
		assetPublic: true,
		token:       "token",
	}, NewPublication("", true, "token"))
}

func TestPublication_Scope(t *testing.T) {
	assert.Equal(t, PublicationScopePrivate, (&Publication{}).Scope())
	assert.Equal(t, PublicationScopePublic, (&Publication{scope: PublicationScopePublic}).Scope())
}

func TestPublication_AssetPublic(t *testing.T) {
	assert.True(t, (&Publication{assetPublic: true}).AssetPublic())
}

func TestPublication_Token(t *testing.T) {
	assert.Equal(t, "token", (&Publication{token: "token"}).Token())
}

func TestPublication_SetScope(t *testing.T) {
	p := &Publication{
		scope: PublicationScopePublic,
	}
	p.SetScope(PublicationScopePrivate)
	assert.Equal(t, &Publication{
		scope: PublicationScopePrivate,
	}, p)

	p = &Publication{}
	p.SetScope(PublicationScopeLimited)
	assert.Equal(t, &Publication{
		scope: PublicationScopeLimited,
	}, p)

	p = &Publication{}
	p.SetScope(PublicationScopePublic)
	assert.Equal(t, &Publication{
		scope: PublicationScopePublic,
	}, p)

	p = &Publication{
		scope: PublicationScopePublic,
	}
	p.SetScope("")
	assert.Equal(t, &Publication{
		scope: PublicationScopePrivate,
	}, p)
}

func TestPublication_SetAssetPublic(t *testing.T) {
	p := &Publication{
		assetPublic: false,
	}
	p.SetAssetPublic(true)
	assert.Equal(t, &Publication{
		assetPublic: true,
	}, p)

	p = &Publication{
		assetPublic: true,
	}
	p.SetAssetPublic(false)
	assert.Equal(t, &Publication{
		assetPublic: false,
	}, p)
}

func TestPublication_SetToken(t *testing.T) {
	p := &Publication{}
	p.SetToken("token")
	assert.Equal(t, &Publication{
		token: "token",
	}, p)
}

func TestPublication_Clone(t *testing.T) {
	p := &Publication{
		assetPublic: false,
		scope:       PublicationScopeLimited,
		token:       "token",
	}
	p2 := p.Clone()
	assert.Equal(t, p, p2)
	assert.NotSame(t, p, p2)
	assert.Nil(t, (*Publication)(nil).Clone())
}

package account

import (
	"context"

	"github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	accountdomainuser "github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

type memoryAccount struct {
	users user.List
}

func NewInMemory(users user.List) gateway.Account {
	return &memoryAccount{
		users: users,
	}
}

func NewInMemory2(users accountdomainuser.List) gateway.Account {
	ul := lo.Map(users, func(pu *accountdomainuser.User, _ int) *user.User {
		m := user.MetadataFrom(pu.Metadata().PhotoURL(), pu.Metadata().Description(), pu.Metadata().Website(), pu.Metadata().Lang(), user.Theme(pu.Metadata().Theme()))

		ub := user.New().
			ID(id.UserID(pu.ID())).
			Name(pu.Name()).
			Alias(pu.Alias()).
			Email(pu.Email()).
			Workspace(user.WorkspaceID(pu.Workspace())).
			Metadata(m)
		u, _ := ub.Build()
		return u
	})
	return &memoryAccount{
		users: ul,
	}
}

func (a *memoryAccount) FindMe(ctx context.Context) (*user.User, error) {
	ctxU := adapter.User(ctx)
	for _, u := range a.users {
		if u.ID().String() == ctxU.ID().String() {
			return u, nil
		}
	}
	return nil, rerror.ErrNotFound
}

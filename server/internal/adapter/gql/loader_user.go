package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase/accountinterfaces"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type UserLoader struct {
	usecase accountinterfaces.User
}

func NewUserLoader(usecase accountinterfaces.User) *UserLoader {
	return &UserLoader{usecase: usecase}
}

func (c *UserLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.User, []error) {
	uIDs, err := util.TryMap(ids, gqlmodel.ToID[accountdomain.User])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FetchByID(ctx, uIDs)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(uIDs, func(id accountdomain.UserID, _ int) *gqlmodel.User {
		u, ok := lo.Find(res, func(u *user.User) bool {
			return u != nil && u.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToUser(u)
	}), nil
}

func (c *UserLoader) ByNameOrEmail(ctx context.Context, nameOrEmail string) (*gqlmodel.User, error) {
	res, err := c.usecase.FetchByNameOrEmail(ctx, nameOrEmail)
	if err != nil {
		return nil, err
	}

	return gqlmodel.SimpleToUser(res), nil
}

func (c *UserLoader) Search(ctx context.Context, nameOrEmail string) ([]*gqlmodel.User, error) {
	res, err := c.usecase.SearchUser(ctx, nameOrEmail)
	if err != nil {
		return nil, err
	}

	return lo.Map(res, func(u *user.Simple, _ int) *gqlmodel.User {
		return gqlmodel.SimpleToUser(u)
	}), nil
}

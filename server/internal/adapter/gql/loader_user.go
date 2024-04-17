package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
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

func (c *UserLoader) SearchUser(ctx context.Context, nameOrEmail string) (*gqlmodel.User, error) {
	res, err := c.usecase.SearchUser(ctx, nameOrEmail)
	if err != nil {
		return nil, err
	}

	return gqlmodel.SimpleToUser(res), nil
}

// data loader

type UserDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.User, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.User, []error)
}

func (c *UserLoader) DataLoader(ctx context.Context) UserDataLoader {
	return gqldataloader.NewUserLoader(gqldataloader.UserLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.User, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *UserLoader) OrdinaryDataLoader(ctx context.Context) UserDataLoader {
	return &ordinaryUserLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.User, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryUserLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.User, []error)
}

func (l *ordinaryUserLoader) Load(key gqlmodel.ID) (*gqlmodel.User, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryUserLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.User, []error) {
	return l.fetch(keys)
}

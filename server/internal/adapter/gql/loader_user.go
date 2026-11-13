package gql

import (
	"context"
	"strings"

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

// Search finds users to invite to a workspace without exposing other users' email addresses.
// SearchUser matches names partially and emails only exactly, so the email is returned only when the keyword is that email.
// A keyword containing "@" is treated as an email lookup and matches only an identical email.
func (c *UserLoader) Search(ctx context.Context, keyword string) ([]*gqlmodel.User, error) {
	keyword = strings.TrimSpace(keyword)

	res, err := c.usecase.SearchUser(ctx, keyword)
	if err != nil {
		return nil, err
	}

	isEmail := strings.Contains(keyword, "@")
	return lo.FilterMap(res, func(u *user.Simple, _ int) (*gqlmodel.User, bool) {
		if u == nil {
			return nil, false
		}
		emailMatched := strings.EqualFold(u.Email, keyword)
		if isEmail && !emailMatched {
			return nil, false
		}
		gu := gqlmodel.SimpleToUser(u)
		if !emailMatched {
			gu.Email = ""
		}
		return gu, true
	}), nil
}

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

// Search finds users to invite to a workspace. SearchUser matches names partially and emails only exactly;
// a keyword containing "@" is treated as an email lookup and keeps only the user with that exact email.
// Emails are never returned (see gqlmodel.SimpleToUser).
func (c *UserLoader) Search(ctx context.Context, keyword string) ([]*gqlmodel.User, error) {
	keyword = strings.TrimSpace(keyword)

	res, err := c.usecase.SearchUser(ctx, keyword)
	if err != nil {
		return nil, err
	}

	isEmail := strings.Contains(keyword, "@")
	return lo.FilterMap(res, func(u *user.Simple, _ int) (*gqlmodel.User, bool) {
		if u == nil || (isEmail && !strings.EqualFold(u.Email, keyword)) {
			return nil, false
		}
		return gqlmodel.SimpleToUser(u), true
	}), nil
}

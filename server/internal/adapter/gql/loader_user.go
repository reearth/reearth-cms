package gql

import (
	"context"
	"errors"
	"strings"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase/accountinterfaces"
	"github.com/reearth/reearthx/rerror"
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

// Search finds users to invite to a workspace without exposing other users' email addresses:
// a keyword containing "@" matches only an identical email, and any other keyword matches names only and returns no email.
func (c *UserLoader) Search(ctx context.Context, keyword string) ([]*gqlmodel.User, error) {
	keyword = strings.TrimSpace(keyword)

	if strings.Contains(keyword, "@") {
		u, err := c.usecase.FetchByNameOrEmail(ctx, keyword)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return []*gqlmodel.User{}, nil
			}
			return nil, err
		}
		if u == nil || !strings.EqualFold(u.Email, keyword) {
			return []*gqlmodel.User{}, nil
		}
		return []*gqlmodel.User{gqlmodel.SimpleToUser(u)}, nil
	}

	res, err := c.usecase.SearchUser(ctx, keyword)
	if err != nil {
		return nil, err
	}

	lowerKeyword := strings.ToLower(keyword)
	return lo.FilterMap(res, func(u *user.Simple, _ int) (*gqlmodel.User, bool) {
		// SearchUser also matches emails partially; drop those hits so emails cannot be probed by substring.
		if u == nil || !strings.Contains(strings.ToLower(u.Name), lowerKeyword) {
			return nil, false
		}
		gu := gqlmodel.SimpleToUser(u)
		gu.Email = ""
		return gu, true
	}), nil
}

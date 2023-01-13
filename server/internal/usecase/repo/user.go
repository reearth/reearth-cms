package repo

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

var ErrDuplicatedUser = errors.New("duplicated user")

type User interface {
	FindByIDs(context.Context, id.UserIDList) ([]*user.User, error)
	FindByID(context.Context, id.UserID) (*user.User, error)
	FindBySub(context.Context, string) (*user.User, error)
	FindByEmail(context.Context, string) (*user.User, error)
	FindByName(context.Context, string) (*user.User, error)
	FindByNameOrEmail(context.Context, string) (*user.User, error)
	FindByVerification(context.Context, string) (*user.User, error)
	FindByPasswordResetRequest(context.Context, string) (*user.User, error)
	FindBySubOrCreate(context.Context, *user.User, string) (*user.User, error)
	Create(context.Context, *user.User) error
	Save(context.Context, *user.User) error
	Remove(context.Context, id.UserID) error
}

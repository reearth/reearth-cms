package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearth-cms/server/pkg/util"
)

type User struct {
	data util.SyncMap[id.UserID, *user.User]
}

func NewUser() repo.User {
	return &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}
}

func (r *User) FindByIDs(ctx context.Context, ids id.UserIDList) ([]*user.User, error) {
	res := r.data.FindAll(func(key id.UserID, value *user.User) bool {
		var res bool
		for _, uid := range ids {
			res = res || key == uid
		}
		return res
	})

	return res, nil
}

func (r *User) FindByID(ctx context.Context, v id.UserID) (*user.User, error) {
	if res := r.data.Find(func(key id.UserID, value *user.User) bool {
		return key == v
	}); res != nil {
		return res, nil
	}

	return nil, rerror.ErrNotFound
}

func (r *User) Save(ctx context.Context, u *user.User) error {
	r.data.Store(u.ID(), u)
	return nil
}

func (r *User) FindBySub(ctx context.Context, auth0sub string) (*user.User, error) {
	if auth0sub == "" {
		return nil, rerror.ErrInvalidParams
	}

	if res := r.data.Find(func(key id.UserID, value *user.User) bool {
		return value.ContainAuth(user.AuthFromAuth0Sub(auth0sub))
	}); res != nil {
		return res, nil
	}

	return nil, rerror.ErrNotFound
}

func (r *User) FindByPasswordResetRequest(ctx context.Context, token string) (*user.User, error) {
	if token == "" {
		return nil, rerror.ErrInvalidParams
	}

	if res := r.data.Find(func(key id.UserID, value *user.User) bool {
		return value.PasswordReset() != nil && value.PasswordReset().Token == token
	}); res != nil {
		return res, nil
	}

	return nil, rerror.ErrNotFound
}

func (r *User) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	if email == "" {
		return nil, rerror.ErrInvalidParams
	}

	if res := r.data.Find(func(key id.UserID, value *user.User) bool {
		return value.Email() == email
	}); res != nil {
		return res, nil
	}

	return nil, rerror.ErrNotFound
}

func (r *User) FindByName(ctx context.Context, name string) (*user.User, error) {
	if name == "" {
		return nil, rerror.ErrInvalidParams
	}

	if res := r.data.Find(func(key id.UserID, value *user.User) bool {
		return value.Name() == name
	}); res != nil {
		return res, nil
	}

	return nil, rerror.ErrNotFound
}

func (r *User) FindByNameOrEmail(ctx context.Context, nameOrEmail string) (*user.User, error) {
	if nameOrEmail == "" {
		return nil, rerror.ErrInvalidParams
	}

	if res := r.data.Find(func(key id.UserID, value *user.User) bool {
		return value.Email() == nameOrEmail || value.Name() == nameOrEmail
	}); res != nil {
		return res, nil
	}

	return nil, rerror.ErrNotFound
}

func (r *User) Remove(ctx context.Context, user id.UserID) error {
	r.data.Delete(user)
	return nil
}

func (r *User) FindByVerification(ctx context.Context, code string) (*user.User, error) {
	if code == "" {
		return nil, rerror.ErrInvalidParams
	}

	if res := r.data.Find(func(key id.UserID, value *user.User) bool {
		return value.Verification() != nil && value.Verification().Code() == code
	}); res != nil {
		return res, nil
	}

	return nil, rerror.ErrNotFound
}

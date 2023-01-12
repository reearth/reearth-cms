package interfaces

import (
	"context"
	"errors"

	"golang.org/x/text/language"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

var (
	ErrUserInvalidPasswordConfirmation = errors.New("invalid password confirmation")
	ErrUserInvalidPasswordReset        = errors.New("invalid password reset request")
	ErrUserInvalidLang                 = errors.New("invalid lang")
	ErrSignupInvalidSecret             = errors.New("invalid secret")
	ErrInvalidUserEmail                = errors.New("invalid email")
	ErrNotVerifiedUser                 = errors.New("not verified user")
	ErrInvalidEmailOrPassword          = errors.New("invalid email or password")
	ErrUserAlreadyExists               = errors.New("user already exists")
)

type SignupOIDC struct {
	Email  string
	Name   string
	Secret *string
	Sub    string
}
type SignupParam struct {
	Email       string
	Name        string
	Password    string
	Secret      *string
	Lang        *language.Tag
	Theme       *user.Theme
	UserID      *id.UserID
	WorkspaceID *id.WorkspaceID
}

type UserFindOrCreateParam struct {
	Sub   string
	ISS   string
	Token string
}

type GetUserByCredentials struct {
	Email    string
	Password string
}

type UpdateMeParam struct {
	Name                 *string
	Email                *string
	Lang                 *language.Tag
	Theme                *user.Theme
	Password             *string
	PasswordConfirmation *string
}

type User interface {
	Fetch(context.Context, []id.UserID, *usecase.Operator) ([]*user.User, error)
	Signup(context.Context, SignupParam) (*user.User, error)
	SignupOIDC(context.Context, SignupOIDC) (*user.User, error)
	FindOrCreate(context.Context, UserFindOrCreateParam) (*user.User, error)
	UpdateMe(context.Context, UpdateMeParam, *usecase.Operator) (*user.User, error)
	RemoveMyAuth(context.Context, string, *usecase.Operator) (*user.User, error)
	SearchUser(context.Context, string, *usecase.Operator) (*user.User, error)
	DeleteMe(context.Context, id.UserID, *usecase.Operator) error
}

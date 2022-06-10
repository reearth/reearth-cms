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
	ErrSignupInvalidName               = errors.New("invalid name")
	ErrInvalidUserEmail                = errors.New("invalid email")
	ErrNotVerifiedUser                 = errors.New("not verified user")
	ErrSignupInvalidPassword           = errors.New("invalid password")
	ErrUserAlreadyExists               = errors.New("user already exists")
)

type SignupParam struct {
	Sub      *string // required by Auth0
	Email    string
	Name     string
	Password *string
	Secret   *string
	User     SignupUserParam
}

type SignupOIDCParam struct {
	AccessToken string
	Issuer      string
	Sub         string
	Email       string
	Name        string
	Secret      *string
	User        SignupUserParam
}

type SignupUserParam struct {
	UserID      *id.UserID
	Lang        *language.Tag
	Theme       *user.Theme
	WorkspaceID *id.WorkspaceID
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
	GetUserByCredentials(context.Context, GetUserByCredentials) (*user.User, error)
	GetUserBySubject(context.Context, string) (*user.User, error)
	UpdateMe(context.Context, UpdateMeParam, *usecase.Operator) (*user.User, error)
	RemoveMyAuth(context.Context, string, *usecase.Operator) (*user.User, error)
	SearchUser(context.Context, string, *usecase.Operator) (*user.User, error)
	DeleteMe(context.Context, id.UserID, *usecase.Operator) error
}

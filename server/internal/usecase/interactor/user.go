package interactor

import (
	"bytes"
	"context"
	_ "embed"
	"errors"
	htmlTmpl "html/template"
	"net/mail"
	textTmpl "text/template"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/log"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

type User struct {
	repos           *repo.Container
	gateways        *gateway.Container
	signupSecret    string
	authSrvUIDomain string
}

type mailContent struct {
	UserName    string
	Message     string
	Suffix      string
	ActionLabel string
	ActionURL   htmlTmpl.URL
}

var (
	//go:embed emails/auth_html.tmpl
	autHTMLTMPLStr string
	//go:embed emails/auth_text.tmpl
	authTextTMPLStr string

	authTextTMPL *textTmpl.Template
	authHTMLTMPL *htmlTmpl.Template

	passwordResetMailContent mailContent
)

func init() {
	var err error
	authTextTMPL, err = textTmpl.New("passwordReset").Parse(authTextTMPLStr)
	if err != nil {
		log.Panicf("password reset email template parse error: %s\n", err)
	}
	authHTMLTMPL, err = htmlTmpl.New("passwordReset").Parse(autHTMLTMPLStr)
	if err != nil {
		log.Panicf("password reset email template parse error: %s\n", err)
	}

	passwordResetMailContent = mailContent{
		Message:     "Thank you for using Re:Earth. We’ve received a request to reset your password. If this was you, please click the link below to confirm and change your password.",
		Suffix:      "If you did not mean to reset your password, then you can ignore this email.",
		ActionLabel: "Confirm to reset your password",
	}
}

func NewUser(r *repo.Container, g *gateway.Container, signupSecret, authSrcUIDomain string) interfaces.User {
	return &User{
		repos:           r,
		gateways:        g,
		signupSecret:    signupSecret,
		authSrvUIDomain: authSrcUIDomain,
	}
}
func (i *User) Fetch(ctx context.Context, ids []id.UserID, operator *usecase.Operator) ([]*user.User, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() ([]*user.User, error) {
		res, err := i.repos.User.FindByIDs(ctx, ids)
		if err != nil {
			return res, err
		}
		// filter
		for k, u := range res {
			workspaces, err := i.repos.Workspace.FindByUser(ctx, u.ID())
			if err != nil {
				return res, err
			}
			workspaceIDs := make([]id.WorkspaceID, 0, len(workspaces))
			for _, t := range workspaces {
				if t != nil {
					workspaceIDs = append(workspaceIDs, t.ID())
				}
			}
			if !operator.IsReadableWorkspace(workspaceIDs...) {
				res[k] = nil
			}
		}
		return res, nil
	})
}

func (i *User) GetUserByCredentials(ctx context.Context, inp interfaces.GetUserByCredentials) (u *user.User, err error) {
	return Run1(ctx, nil, i.repos, Usecase().Transaction(), func() (*user.User, error) {
		u, err = i.repos.User.FindByNameOrEmail(ctx, inp.Email)
		if err != nil && !errors.Is(rerror.ErrNotFound, err) {
			return nil, err
		} else if u == nil {
			return nil, interfaces.ErrInvalidUserEmail
		}
		matched, err := u.MatchPassword(inp.Password)
		if err != nil {
			return nil, err
		}
		if !matched {
			return nil, interfaces.ErrSignupInvalidPassword
		}
		if u.Verification() == nil || !u.Verification().IsVerified() {
			return nil, interfaces.ErrNotVerifiedUser
		}
		return u, nil
	})
}

func (i *User) GetUserBySubject(ctx context.Context, sub string) (u *user.User, err error) {
	return Run1(ctx, nil, i.repos, Usecase().Transaction(), func() (*user.User, error) {
		u, err = i.repos.User.FindBySub(ctx, sub)
		if err != nil {
			return nil, err
		}
		return u, nil
	})
}

func (i *User) StartPasswordReset(ctx context.Context, email string) error {
	return Run0(ctx, nil, i.repos, Usecase().Transaction(), func() error {

		u, err := i.repos.User.FindByEmail(ctx, email)
		if err != nil {
			return err
		}

		pr := user.NewPasswordReset()
		u.SetPasswordReset(pr)

		if err := i.repos.User.Save(ctx, u); err != nil {
			return err
		}

		var TextOut, HTMLOut bytes.Buffer
		link := i.authSrvUIDomain + "/?pwd-reset-token=" + pr.Token
		passwordResetMailContent.UserName = u.Name()
		passwordResetMailContent.ActionURL = htmlTmpl.URL(link)

		if err := authTextTMPL.Execute(&TextOut, passwordResetMailContent); err != nil {
			return err
		}
		if err := authHTMLTMPL.Execute(&HTMLOut, passwordResetMailContent); err != nil {
			return err
		}

		err = i.gateways.Mailer.SendMail([]gateway.Contact{
			{
				Email: u.Email(),
				Name:  u.Name(),
			},
		}, "Password reset", TextOut.String(), HTMLOut.String())
		if err != nil {
			return err
		}

		return nil
	})
}

func (i *User) PasswordReset(ctx context.Context, password, token string) error {

	return Run0(ctx, nil, i.repos, Usecase().Transaction(), func() error {
		u, err := i.repos.User.FindByPasswordResetRequest(ctx, token)
		if err != nil {
			return err
		}

		passwordReset := u.PasswordReset()
		ok := passwordReset.Validate(token)

		if !ok {
			return interfaces.ErrUserInvalidPasswordReset
		}

		u.SetPasswordReset(nil)

		if err := u.SetPassword(password); err != nil {
			return err
		}

		if err := i.repos.User.Save(ctx, u); err != nil {
			return err
		}

		return nil
	})
}

func (i *User) UpdateMe(ctx context.Context, p interfaces.UpdateMeParam, operator *usecase.Operator) (u *user.User, err error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*user.User, error) {
		if p.Password != nil {
			if p.PasswordConfirmation == nil || *p.Password != *p.PasswordConfirmation {
				return nil, interfaces.ErrUserInvalidPasswordConfirmation
			}
		}

		var workspace *user.Workspace

		u, err = i.repos.User.FindByID(ctx, operator.User)
		if err != nil {
			return nil, err
		}

		if p.Name != nil && *p.Name != u.Name() {
			// username should not be a valid mail
			if _, err := mail.ParseAddress(*p.Name); err == nil {
				return nil, interfaces.ErrSignupInvalidName
			}
			// make sure the username is not exists
			if userByName, _ := i.repos.User.FindByName(ctx, *p.Name); userByName != nil {
				return nil, interfaces.ErrSignupInvalidName
			}
			oldName := u.Name()
			u.UpdateName(*p.Name)

			workspace, err = i.repos.Workspace.FindByID(ctx, u.Workspace())
			if err != nil && !errors.Is(err, rerror.ErrNotFound) {
				return nil, err
			}

			tn := workspace.Name()
			if tn == "" || tn == oldName {
				workspace.Rename(*p.Name)
			} else {
				workspace = nil
			}
		}
		if p.Email != nil {
			if err := u.UpdateEmail(*p.Email); err != nil {
				return nil, err
			}
		}
		if p.Lang != nil {
			u.UpdateLang(*p.Lang)
		}
		if p.Theme != nil {
			u.UpdateTheme(*p.Theme)
		}

		if p.Password != nil && u.HasAuthProvider("reearth") {
			if err := u.SetPassword(*p.Password); err != nil {
				return nil, err
			}
		}

		// Update Auth0 users
		if p.Name != nil || p.Email != nil || p.Password != nil {
			for _, a := range u.Auths() {
				if a.Provider != "auth0" {
					continue
				}
				if _, err := i.gateways.Authenticator.UpdateUser(gateway.AuthenticatorUpdateUserParam{
					ID:       a.Sub,
					Name:     p.Name,
					Email:    p.Email,
					Password: p.Password,
				}); err != nil {
					return nil, err
				}
			}
		}

		if workspace != nil {
			err = i.repos.Workspace.Save(ctx, workspace)
			if err != nil {
				return nil, err
			}
		}

		err = i.repos.User.Save(ctx, u)
		if err != nil {
			return nil, err
		}

		return u, nil
	})
}

func (i *User) RemoveMyAuth(ctx context.Context, authProvider string, operator *usecase.Operator) (u *user.User, err error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*user.User, error) {

		u, err = i.repos.User.FindByID(ctx, operator.User)
		if err != nil {
			return nil, err
		}

		u.RemoveAuthByProvider(authProvider)

		err = i.repos.User.Save(ctx, u)
		if err != nil {
			return nil, err
		}

		return u, nil
	})
}

func (i *User) SearchUser(ctx context.Context, nameOrEmail string, operator *usecase.Operator) (u *user.User, err error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(), func() (*user.User, error) {
		u, err = i.repos.User.FindByNameOrEmail(ctx, nameOrEmail)
		if err != nil && !errors.Is(err, rerror.ErrNotFound) {
			return nil, err
		}
		return u, nil
	})
}

func (i *User) DeleteMe(ctx context.Context, userID id.UserID, operator *usecase.Operator) (err error) {
	return Run0(ctx, operator, i.repos, Usecase().Transaction(), func() error {
		if userID.IsNil() || userID != operator.User {
			return errors.New("invalid user id")
		}

		u, err := i.repos.User.FindByID(ctx, userID)
		if err != nil && !errors.Is(err, rerror.ErrNotFound) {
			return err
		}
		if u == nil {
			return nil
		}

		workspaces, err := i.repos.Workspace.FindByUser(ctx, u.ID())
		if err != nil {
			return err
		}

		updatedWorkspaces := make([]*user.Workspace, 0, len(workspaces))
		deletedWorkspaces := []id.WorkspaceID{}

		for _, workspace := range workspaces {
			if !workspace.IsPersonal() && !workspace.Members().IsOnlyOwner(u.ID()) {
				_ = workspace.Members().Leave(u.ID())
				updatedWorkspaces = append(updatedWorkspaces, workspace)
				continue
			}

			deletedWorkspaces = append(deletedWorkspaces, workspace.ID())
		}

		// Save workspaces
		if err := i.repos.Workspace.SaveAll(ctx, updatedWorkspaces); err != nil {
			return err
		}

		// Delete workspaces
		if err := i.repos.Workspace.RemoveAll(ctx, deletedWorkspaces); err != nil {
			return err
		}

		// Delete user
		if err := i.repos.User.Remove(ctx, u.ID()); err != nil {
			return err
		}

		return nil
	})

}

func (i *User) CreateVerification(ctx context.Context, email string) error {

	return Run0(ctx, nil, i.repos, Usecase().Transaction(), func() error {
		u, err := i.repos.User.FindByEmail(ctx, email)
		if err != nil {
			return err
		}
		if u.Verification().IsVerified() {
			return nil
		}
		return i.createVerification(ctx, u)
	})
}

func (i *User) VerifyUser(ctx context.Context, code string) (*user.User, error) {

	return Run1(ctx, nil, i.repos, Usecase().Transaction(), func() (*user.User, error) {
		u, err := i.repos.User.FindByVerification(ctx, code)
		if err != nil {
			return nil, err
		}
		if u.Verification().IsExpired() {
			return nil, errors.New("verification expired")
		}
		u.Verification().SetVerified(true)
		err = i.repos.User.Save(ctx, u)
		if err != nil {
			return nil, err
		}
		return u, nil
	})

}

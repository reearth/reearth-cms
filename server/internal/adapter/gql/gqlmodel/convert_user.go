package gqlmodel

import (
	apiuser "github.com/reearth/reearth-accounts/server/pkg/user"
	apiworkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
	"golang.org/x/text/language"

	"github.com/reearth/reearthx/util"
)

func SimpleToUser(u *user.Simple) *User {
	if u == nil {
		return nil
	}

	return &User{
		ID:    IDFrom(u.ID),
		Name:  u.Name,
		Email: u.Email,
		Host:  lo.EmptyableToPtr(u.Host),
	}
}

func ToUser(u *user.User) *User {
	if u == nil {
		return nil
	}

	return &User{
		ID:    IDFrom(u.ID()),
		Name:  u.Name(),
		Email: u.Email(),
		Host:  lo.EmptyableToPtr(u.Host()),
	}
}

func ToMe(u *user.User) *Me {
	if u == nil {
		return nil
	}

	// Handle metadata safely
	var lang language.Tag
	var theme user.Theme
	var photoURL string

	if metadata := u.Metadata(); metadata != nil {
		lang = metadata.Lang()
		theme = metadata.Theme()
		photoURL = metadata.PhotoURL()
	}

	return &Me{
		ID:                IDFrom(u.ID()),
		Name:              u.Name(),
		Email:             u.Email(),
		Lang:              lang,
		Host:              lo.EmptyableToPtr(u.Host()),
		Theme:             Theme(theme),
		MyWorkspaceID:     IDFrom(u.Workspace()),
		Auths:             util.Map(u.Auths(), func(a user.Auth) string { return a.Provider }),
		ProfilePictureURL: lo.ToPtr(photoURL),
	}
}

func ToMeFromAPI(u *apiuser.User) *Me {
	if u == nil {
		return nil
	}

	// Handle metadata safely
	var lang language.Tag
	var theme user.Theme
	var photoURL string

	if metadata := u.Metadata(); metadata != nil {
		lang = metadata.Lang()
		theme = user.Theme(metadata.Theme())
		photoURL = metadata.PhotoURL()
	}

	return &Me{
		ID:                IDFrom(u.ID()),
		Name:              u.Name(),
		Email:             u.Email(),
		Lang:              lang,
		Host:              lo.EmptyableToPtr(u.Host()),
		Theme:             Theme(theme),
		MyWorkspaceID:     IDFrom(u.Workspace()),
		Auths:             util.Map((u.Auths()), func(a apiuser.Auth) string { return a.Provider }),
		ProfilePictureURL: lo.ToPtr(photoURL),
	}
}

func ToTheme(t *Theme) *user.Theme {
	if t == nil {
		return nil
	}

	th := user.ThemeDefault
	switch *t {
	case ThemeDark:
		th = user.ThemeDark
	case ThemeLight:
		th = user.ThemeLight
	}
	return &th
}

func ToWorkspaceFromAPI(t *apiworkspace.Workspace) *Workspace {
	if t == nil {
		return nil
	}

	usersMap := t.Members().Users()
	integrationsMap := t.Members().Integrations()
	members := make([]WorkspaceMember, 0, len(usersMap)+len(integrationsMap))
	for u, m := range usersMap {
		members = append(members, &WorkspaceUserMember{
			UserID: IDFrom(u),
			Role:   ToRoleFromAPI(m.Role),
			Host:   lo.EmptyableToPtr(m.Host),
		})
	}
	for i, m := range integrationsMap {
		members = append(members, &WorkspaceIntegrationMember{
			IntegrationID: IDFrom(i),
			Role:          ToRoleFromAPI(m.Role),
			Active:        !m.Disabled,
			InvitedByID:   IDFrom(m.InvitedBy),
			InvitedBy:     nil,
			Integration:   nil,
		})
	}

	return &Workspace{
		ID:       IDFrom(t.ID()),
		Name:     t.Name(),
		Alias:    lo.ToPtr(t.Alias()),
		Personal: t.IsPersonal(),
		Members:  members,
	}
}

func ToRoleFromAPI(r apiworkspace.Role) Role {
	switch r {
	case apiworkspace.RoleReader:
		return RoleReader
	case apiworkspace.RoleWriter:
		return RoleWriter
	case apiworkspace.RoleMaintainer:
		return RoleMaintainer
	case apiworkspace.RoleOwner:
		return RoleOwner
	}
	return Role("")
}

func ToWorkspace(t *workspace.Workspace) *Workspace {
	if t == nil {
		return nil
	}

	usersMap := t.Members().Users()
	integrationsMap := t.Members().Integrations()
	members := make([]WorkspaceMember, 0, len(usersMap)+len(integrationsMap))
	for u, m := range usersMap {
		members = append(members, &WorkspaceUserMember{
			UserID: IDFrom(u),
			Role:   ToRole(m.Role),
			Host:   lo.EmptyableToPtr(m.Host),
		})
	}
	for i, m := range integrationsMap {
		members = append(members, &WorkspaceIntegrationMember{
			IntegrationID: IDFrom(i),
			Role:          ToRole(m.Role),
			Active:        !m.Disabled,
			InvitedByID:   IDFrom(m.InvitedBy),
			InvitedBy:     nil,
			Integration:   nil,
		})
	}

	return &Workspace{
		ID:       IDFrom(t.ID()),
		Name:     t.Name(),
		Alias:    lo.ToPtr(t.Alias()),
		Personal: t.IsPersonal(),
		Members:  members,
	}
}

func FromRole(r Role) workspace.Role {
	switch r {
	case RoleReader:
		return workspace.RoleReader
	case RoleWriter:
		return workspace.RoleWriter
	case RoleMaintainer:
		return workspace.RoleMaintainer
	case RoleOwner:
		return workspace.RoleOwner
	}
	return workspace.Role("")
}

func ToRole(r workspace.Role) Role {
	switch r {
	case workspace.RoleReader:
		return RoleReader
	case workspace.RoleWriter:
		return RoleWriter
	case workspace.RoleMaintainer:
		return RoleMaintainer
	case workspace.RoleOwner:
		return RoleOwner
	}
	return Role("")
}

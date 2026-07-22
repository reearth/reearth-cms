package account

import (
	"context"

	"github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	accountdomainuser "github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"golang.org/x/text/language"
)

type memoryAccount struct {
	users      user.List
	workspaces workspace.List
}

func NewInMemory(users user.List) gateway.Account {
	return &memoryAccount{
		users:      users,
		workspaces: workspace.List{},
	}
}

func NewInMemoryWithWorkspaces(users user.List, workspaces workspace.List) gateway.Account {
	return &memoryAccount{
		users:      users,
		workspaces: workspaces,
	}
}

func NewInMemory2(users accountdomainuser.List) gateway.Account {
	ul := lo.Map(users, func(pu *accountdomainuser.User, _ int) *user.User {
		var photoURL, description, website string
		var lang language.Tag
		var theme user.Theme

		if metadata := pu.Metadata(); metadata != nil {
			photoURL = metadata.PhotoURL()
			description = metadata.Description()
			website = metadata.Website()
			lang = metadata.Lang()
			theme = user.Theme(metadata.Theme())
		}

		m := user.MetadataFrom(photoURL, description, website, lang, theme)

		ub := user.New().
			ID(id.UserID(pu.ID())).
			Name(pu.Name()).
			Alias(pu.Alias()).
			Email(pu.Email()).
			Workspace(user.WorkspaceID(pu.Workspace())).
			Metadata(m)
		u, _ := ub.Build()
		return u
	})
	return &memoryAccount{
		users:      ul,
		workspaces: workspace.List{},
	}
}

func (a *memoryAccount) FindMe(ctx context.Context) (*user.User, error) {
	ctxU := adapter.User(ctx)
	for _, u := range a.users {
		if u.ID().String() == ctxU.ID().String() {
			return u, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (a *memoryAccount) FindByID(ctx context.Context, id string) (*user.User, error) {
	for _, u := range a.users {
		if u.ID().String() == id {
			return u, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (a *memoryAccount) UpdateMe(ctx context.Context, input gateway.UpdateMeInput) (*user.User, error) {
	ctxU := adapter.User(ctx)
	for i, u := range a.users {
		if u.ID().String() == ctxU.ID().String() {
			// Create updated user
			ub := user.New().
				ID(u.ID()).
				Workspace(u.Workspace())

			// Update fields if provided
			if input.Name != nil {
				ub = ub.Name(*input.Name)
			} else {
				ub = ub.Name(u.Name())
			}

			if input.Email != nil {
				ub = ub.Email(*input.Email)
			} else {
				ub = ub.Email(u.Email())
			}

			// Handle alias (keep existing)
			ub = ub.Alias(u.Alias())

			// Update metadata
			var photoURL, description, website string
			var lang language.Tag
			var theme user.Theme

			if metadata := u.Metadata(); metadata != nil {
				photoURL = metadata.PhotoURL()
				description = metadata.Description()
				website = metadata.Website()
				lang = metadata.Lang()
				theme = metadata.Theme()
			}

			if input.Lang != nil {
				if parsedLang, err := language.Parse(*input.Lang); err == nil {
					lang = parsedLang
				}
			}

			if input.Theme != nil {
				theme = user.ThemeFrom(*input.Theme)
			}

			m := user.MetadataFrom(photoURL, description, website, lang, theme)
			ub = ub.Metadata(m)

			updatedUser, err := ub.Build()
			if err != nil {
				return nil, err
			}

			// Replace user in memory
			a.users[i] = updatedUser
			return updatedUser, nil
		}
	}
	return nil, rerror.ErrNotFound
}

func (a *memoryAccount) FindWorkspacesByUser(ctx context.Context, userID string) (workspace.List, error) {
	workspaceUserID, err := workspace.UserIDFrom(userID)
	if err != nil {
		return nil, err
	}
	
	var userWorkspaces workspace.List
	for _, w := range a.workspaces {
		// Check if user is a member of this workspace
		if w.Members().HasUser(workspaceUserID) {
			userWorkspaces = append(userWorkspaces, w)
		}
	}
	return userWorkspaces, nil
}

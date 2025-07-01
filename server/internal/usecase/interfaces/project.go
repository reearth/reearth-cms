package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type ProjectFilter struct {
	Visibility *project.Visibility
}
type CreateProjectParam struct {
	WorkspaceID   accountdomain.WorkspaceID
	Name          *string
	Description   *string
	License       *string
	Readme        *string
	Alias         *string
	RequestRoles  []workspace.Role
	Accessibility *AccessibilityParam
}

type UpdateProjectParam struct {
	ID            id.ProjectID
	Name          *string
	Description   *string
	License       *string
	Readme        *string
	Alias         *string
	RequestRoles  []workspace.Role
	Accessibility *AccessibilityParam
}

type AccessibilityParam struct {
	Visibility  *project.Visibility
	Publication *PublicationSettingsParam
}

type PublicationSettingsParam struct {
	PublicModels project.ModelIDList
	PublicAssets bool
}

type RegenerateKeyParam struct {
	ProjectId id.ProjectID
	KeyId     id.APIKeyID
}

type CreateAPITokenParam struct {
	ProjectID   id.ProjectID
	Name        string
	Description string
	Publication PublicationSettingsParam
}

type UpdateAPITokenParam struct {
	ProjectID   id.ProjectID
	TokenId     id.APIKeyID
	Name        *string
	Description *string
	Publication *PublicationSettingsParam
}

var (
	ErrProjectAliasAlreadyUsed   = rerror.NewE(i18n.T("project alias is already used by another project"))
	ErrInvalidProject            = rerror.NewE(i18n.T("invalid project"))
	ErrProjectCreationNotAllowed = rerror.NewE(i18n.T("project creation not allowed"))
	ErrProjectLimitsExceeded     = rerror.NewE(i18n.T("project limits exceeded"))
)

type Project interface {
	Fetch(context.Context, []id.ProjectID, *usecase.Operator) (project.List, error)
	FindByIDOrAlias(context.Context, project.IDOrAlias, *usecase.Operator) (*project.Project, error)
	FindByWorkspace(context.Context, accountdomain.WorkspaceID, *ProjectFilter, *usecasex.Pagination, *usecase.Operator) (project.List, *usecasex.PageInfo, error)
	Create(context.Context, CreateProjectParam, *usecase.Operator) (*project.Project, error)
	Update(context.Context, UpdateProjectParam, *usecase.Operator) (*project.Project, error)
	CheckAlias(context.Context, string) (bool, error)
	Delete(context.Context, id.ProjectID, *usecase.Operator) error
	CreateAPIKey(context.Context, CreateAPITokenParam, *usecase.Operator) (*project.Project, *project.APIKeyID, error)
	UpdateAPIKey(context.Context, UpdateAPITokenParam, *usecase.Operator) (*project.Project, error)
	DeleteAPIKey(context.Context, id.ProjectID, id.APIKeyID, *usecase.Operator) (*project.Project, error)
	RegenerateAPIKeyKey(context.Context, RegenerateKeyParam, *usecase.Operator) (*project.Project, error)
}

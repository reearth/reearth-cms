package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var ErrWorkspaceHasProjects error = rerror.NewE(i18n.T("can't delete a workspace as it still has projects"))

// WorkspaceDeleter deletes a workspace together with its CMS data.
type WorkspaceDeleter interface {
	Delete(context.Context, accountdomain.WorkspaceID, *usecase.Operator) error
}

package gateway

import (
	"context"

	"github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth-accounts/server/pkg/workspace"
)

type UpdateMeInput struct {
	Name                 *string
	Email                *string
	Lang                 *string
	Theme                *string
	Password             *string
	PasswordConfirmation *string
}

type Account interface {
	FindMe(ctx context.Context) (*user.User, error)
	FindByID(ctx context.Context, id string) (*user.User, error)
	UpdateMe(ctx context.Context, input UpdateMeInput) (*user.User, error)
	FindWorkspacesByUser(ctx context.Context, userID string) (workspace.List, error)
}

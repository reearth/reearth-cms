package gateway

import (
	"context"

	"github.com/reearth/reearth-accounts/server/pkg/user"
)

type Account interface {
	FindMe(ctx context.Context) (*user.User, error)
}

package account

import (
	"context"

	"github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
)

type accountMock struct {
}

func NewMock() gateway.Account {
	return &accountMock{}
}

func (a *accountMock) FindMe(_ context.Context) (*user.User, error) {
	panic("not implemented")
	return nil, nil
}

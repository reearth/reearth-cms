package interactor

import (
	"context"
)

func (u *Usecase) Copy(ctx context.Context, filter, changes string) error {
	return u.repos.Copier.Copy(ctx, filter, changes)
}

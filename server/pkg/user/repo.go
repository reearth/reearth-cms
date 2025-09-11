package user

import (
	"context"
)

type Repo interface {
	FindMe(context.Context) (*User, error)
}

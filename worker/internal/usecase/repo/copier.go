package repo

import (
	"context"
)

type Copier interface {
	Copy(context.Context, string, string) error
}

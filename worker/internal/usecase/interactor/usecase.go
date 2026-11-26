package interactor

import (
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
)

// DefaultMaxDecompressAttempts is how many times the same archive may be
// attempted without progress before it is marked as failed.
const DefaultMaxDecompressAttempts = 3

type Usecase struct {
	gateways *gateway.Container
	repos    *repo.Container

	maxDecompressAttempts int
}

type Option func(*Usecase)

// WithMaxDecompressAttempts sets how many attempts without progress are
// allowed per archive. Values <= 0 keep the default.
func WithMaxDecompressAttempts(n int) Option {
	return func(u *Usecase) {
		if n > 0 {
			u.maxDecompressAttempts = n
		}
	}
}

func NewUsecase(g *gateway.Container, r *repo.Container, opts ...Option) *Usecase {
	u := &Usecase{
		gateways:              g,
		repos:                 r,
		maxDecompressAttempts: DefaultMaxDecompressAttempts,
	}
	for _, o := range opts {
		o(u)
	}
	return u
}

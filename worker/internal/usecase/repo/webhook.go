package repo

import "context"

type Webhook interface {
	Get(ctx context.Context, eventID string) (bool, error)
	Set(ctx context.Context, eventID string) error
}

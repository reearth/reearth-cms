package gateway

import "context"

type Subscriber interface {
	Subscribe(ctx context.Context) (result interface{}, err error)
}

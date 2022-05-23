package gateway

import "context"

type Publisher interface {
	Publish(ctx context.Context, topic Topic, payload Payload) (eventId string, err error)
}

type Topic struct {
	name string
}

type Payload struct {
}

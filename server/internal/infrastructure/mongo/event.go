package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearthx/mongox"
)

var (
	eventIndexes       = []string{"user", "integration"}
	eventUniqueIndexes = []string{"id"}
)

type Event struct {
	client *mongox.ClientCollection
}

func NewEvent(client *mongox.Client) repo.Event {
	return &Event{client: client.WithCollection("event")}
}

func (r *Event) Init() error {
	return createIndexes(context.Background(), r.client, eventIndexes, eventUniqueIndexes)
}

func (r *Event) Save(ctx context.Context, ev *event.Event[any]) error {
	doc, eID, err := mongodoc.NewEvent(ev)
	if err != nil {
		return err
	}
	return r.client.SaveOne(ctx, eID, doc)
}

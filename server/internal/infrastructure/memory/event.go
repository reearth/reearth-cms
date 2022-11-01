package memory

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type Event struct {
	data *util.SyncMap[id.EventID, *event.Event[any]]
	now  *util.TimeNow
	err  error
}

func NewEvent() repo.Event {
	return &Event{
		data: &util.SyncMap[id.EventID, *event.Event[any]]{},
		now:  &util.TimeNow{},
	}
}

func (r *Event) Save(ctx context.Context, ev *event.Event[any]) error {
	if r.err != nil {
		return r.err
	}
	r.data.Store(ev.ID(), ev)
	return nil
}

func (r *Event) Remove(_ context.Context, eID id.EventID) error {
	if r.err != nil {
		return r.err
	}

	if _, ok := r.data.Load(eID); ok {
		r.data.Delete(eID)
		return nil
	}
	return rerror.ErrNotFound
}

func MockEventNow(r repo.Event, t time.Time) func() {
	return r.(*Event).now.Mock(t)
}

func SetEventError(r repo.Event, err error) {
	r.(*Event).err = err
}

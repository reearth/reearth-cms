package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/event"
)

type Event interface {
	Save(context.Context, *event.Event[any]) error
}

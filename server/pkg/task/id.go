package task

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type ID = id.TaskID

var NewID = id.NewTaskID

var MustID = id.MustTaskID

var IDFrom = id.TaskIDFrom

var IDFromRef = id.TaskIDFromRef

var ErrInvalidID = id.ErrInvalidID

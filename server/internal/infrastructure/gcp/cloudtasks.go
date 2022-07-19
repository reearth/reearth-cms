package gcp

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/task"
)

// Queue tasks care of queuing and Tasks will be added to it
type Queue struct {
}

type RequestType string

const (
	HTTP = RequestType("http")
)

// Task is request for subscriber
type Task struct {
	reqType RequestType
	payload any
}

type Config struct {
	GCPProject string
	GCPRegion  string
	QueueName  string
}

func NewTaskRunner(c *Config) gateway.TaskRunner {
	// TODO: convert config to Queue struct
	return &Queue{}
}

func NewTask() *Task {
	//TODO: impl here
	return &Task{}
}

// Run implements gateway.TaskRunner
func (*Queue) Run(ctx context.Context, p task.Payload) (id.TaskID, error) {
	//TODO: implement login to add task to the queue with payload
	panic("unimplemented")
}

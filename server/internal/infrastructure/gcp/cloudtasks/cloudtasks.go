package cloudtasks

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
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

func NewQueue(c *Config) gateway.Queue {
	// TODO: convert config to Queue struct
	return &Queue{}
}

func NewTask() *Task {
	//TODO: impl here
	return &Task{}
}

// AddTask implements gateway.Queue
func (*Queue) AddTask(ctx context.Context) error {
	//TODO: implement login to add task to the queue with payload
	panic("unimplemented")
}

package gcp

import (
	"context"
	"encoding/json"

	cloudtasks "cloud.google.com/go/cloudtasks/apiv2"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/id/idx"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"google.golang.org/api/option"
	taskspb "google.golang.org/genproto/googleapis/cloud/tasks/v2"
)

type TaskRunner struct {
	queuePath     string
	subscriberURL string
	credFilePath  string
}

func NewTaskRunner(c *CloudTasksConfig, opts ...TaskRunnerOption) (gateway.TaskRunner, error) {
	opts2 := defaultTaskRunnerOptions()
	for _, o := range opts {
		o.Apply(opts2)
	}

	qURL, err := c.buildQueueUrl()
	if err != nil {
		return nil, err
	}

	return &TaskRunner{
		queuePath:     qURL,
		subscriberURL: c.SubscriberURL,
		credFilePath:  opts2.credFilePath,
	}, nil
}

// Run implements gateway.TaskRunner
func (t *TaskRunner) Run(ctx context.Context, p task.Payload) (id.TaskID, error) {

	client, closeFn, err := t.client(ctx)
	if err != nil {
		return idx.ID[id.Task]{}, err
	}
	defer closeFn()

	bPayload, err := json.Marshal(p.DecompressAsset.Payload())
	if err != nil {
		return idx.ID[id.Task]{}, err
	}
	req := t.buildRequest(t.subscriberURL, bPayload)

	_, err = client.CreateTask(ctx, req)
	if err != nil {
		return idx.ID[id.Task]{}, err
	}

	//TODO: impl here
	return idx.ID[id.Task]{}, nil
}

func (t *TaskRunner) client(ctx context.Context) (*cloudtasks.Client, func(), error) {
	var c *cloudtasks.Client
	var err error
	if t.credFilePath == "" {
		c, err = cloudtasks.NewClient(ctx)
	} else {
		c, err = cloudtasks.NewClient(ctx, option.WithCredentialsFile(t.credFilePath))
	}
	if err != nil {
		return nil, nil, err
	}
	return c, func() { c.Close() }, nil
}

func (t *TaskRunner) buildRequest(url string, message []byte) *taskspb.CreateTaskRequest {
	return &taskspb.CreateTaskRequest{
		Parent: t.queuePath,
		Task: &taskspb.Task{
			MessageType: &taskspb.Task_HttpRequest{
				HttpRequest: &taskspb.HttpRequest{
					HttpMethod: taskspb.HttpMethod_POST,
					Url:        url,
					Body:       message,
				},
			},
		},
	}
}

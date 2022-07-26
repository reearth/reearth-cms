package gcp

import (
	"context"
	"encoding/json"

	cloudtasks "cloud.google.com/go/cloudtasks/apiv2"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/task"
	taskspb "google.golang.org/genproto/googleapis/cloud/tasks/v2"
)

type TaskRunner struct {
	queuePath     string
	subscriberURL string
}

func NewTaskRunner(c *CloudTasksConfig) (gateway.TaskRunner, error) {
	qURL, err := c.buildQueueUrl()
	if err != nil {
		return nil, err
	}

	return &TaskRunner{
		queuePath:     qURL,
		subscriberURL: c.SubscriberURL,
	}, nil
}

// Run implements gateway.TaskRunner
func (t *TaskRunner) Run(ctx context.Context, p task.Payload) error {

	client, closeFn, err := t.client(ctx)
	if err != nil {
		return err
	}
	defer closeFn()

	bPayload, err := json.Marshal(p.DecompressAsset.Payload())
	if err != nil {
		return err
	}
	req := t.buildRequest(t.subscriberURL, bPayload)

	_, err = client.CreateTask(ctx, req)
	if err != nil {
		return err
	}

	return nil
}

func (t *TaskRunner) client(ctx context.Context) (*cloudtasks.Client, func(), error) {
	var c *cloudtasks.Client
	var err error
	c, err = cloudtasks.NewClient(ctx)

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

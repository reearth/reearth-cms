package gcp

import (
	"context"
	"encoding/json"

	cloudtasks "cloud.google.com/go/cloudtasks/apiv2"
	"github.com/googleapis/gax-go/v2"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/task"
	taskspb "google.golang.org/genproto/googleapis/cloud/tasks/v2"
)

type TaskRunner struct {
	queuePath     string
	subscriberURL string
	c             *cloudtasks.Client
}

func NewTaskRunner(ctx context.Context, c *CloudTasksConfig) (gateway.TaskRunner, error) {
	qURL, err := c.buildQueueUrl()
	if err != nil {
		return nil, err
	}

	cl, err := cloudtasks.NewClient(ctx)
	if err != nil {
		return nil, err
	}

	return &TaskRunner{
		queuePath:     qURL,
		c:             cl,
		subscriberURL: c.SubscriberURL,
	}, nil
}

// Run implements gateway.TaskRunner
func (t *TaskRunner) Run(ctx context.Context, p task.Payload) error {
	bPayload, err := json.Marshal(p.DecompressAsset.Payload())
	if err != nil {
		return err
	}
	req := t.buildRequest(t.subscriberURL, bPayload)

	_, err = t.CreateTask(ctx, req)
	if err != nil {
		return err
	}

	return nil
}

// setClient is intended to be used for testing to inject client from external
func (t *TaskRunner) setClient(c *cloudtasks.Client) {
	t.c = c
}

// CloseConn is the function to close cloudtasks Client's connection. We expect this function is prepared for interactive connection since GCP SDK uses gRPC internally. To avoid instantiate client everytime, we keep the client's instance.
func (t *TaskRunner) CloseConn() error {
	return t.c.Close()
}

func (t *TaskRunner) CreateTask(ctx context.Context, req *taskspb.CreateTaskRequest, opts ...gax.CallOption) (*taskspb.Task, error) {
	return t.c.CreateTask(ctx, req, opts...)
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

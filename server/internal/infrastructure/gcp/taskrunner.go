package gcp

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"path"

	cloudtasks "cloud.google.com/go/cloudtasks/apiv2"
	taskspb "cloud.google.com/go/cloudtasks/apiv2/cloudtaskspb"
	"cloud.google.com/go/pubsub"
	"github.com/googleapis/gax-go/v2"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"google.golang.org/api/cloudbuild/v1"
	"google.golang.org/protobuf/types/known/durationpb"
)

type TaskRunner struct {
	conf      *TaskConfig
	queuePath string
	c         *cloudtasks.Client
	pubsub    *pubsub.Client
}

func NewTaskRunner(ctx context.Context, conf *TaskConfig) (gateway.TaskRunner, error) {
	qURL, err := conf.buildQueueUrl()
	if err != nil {
		return nil, err
	}

	cl, err := cloudtasks.NewClient(ctx)
	if err != nil {
		return nil, err
	}

	pubsub, err := pubsub.NewClient(ctx, conf.GCPProject)
	if err != nil {
		return nil, err
	}

	return &TaskRunner{
		conf:      conf,
		queuePath: qURL,
		c:         cl,
		pubsub:    pubsub,
	}, nil
}

// Run implements gateway.TaskRunner
func (t *TaskRunner) Run(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return t.runCloudBuild(ctx, p)
	}
	return t.runPubSub(ctx, p)
}

func (t *TaskRunner) runCloudTask(ctx context.Context, p task.Payload) error {
	if p.DecompressAsset == nil {
		return nil
	}

	payload := p.DecompressAsset.Payload().DecompressAsset
	bPayload, err := json.Marshal(struct {
		AssetID string `json:"assetId"`
		Path    string `json:"path"`
	}{AssetID: payload.AssetID, Path: payload.Path})
	if err != nil {
		return err
	}

	req := t.buildRequest(t.conf.SubscriberURL, bPayload)
	_, err = t.createTask(ctx, req)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	log.Infof("task request has been sent: body %#v", p.DecompressAsset.Payload().DecompressAsset)

	return nil
}

func (t *TaskRunner) runCloudBuild(ctx context.Context, p task.Payload) error {
	if p.DecompressAsset == nil {
		return nil
	}

	cb, err := cloudbuild.NewService(ctx)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	src, err := url.JoinPath("gs://"+t.conf.GCSBucket, "assets", p.DecompressAsset.Path)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	dest, err := url.JoinPath("gs://"+t.conf.GCSBucket, "assets", path.Dir(p.DecompressAsset.Path))
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	project := t.conf.GCPProject
	region := t.conf.GCPRegion

	build := &cloudbuild.Build{
		Timeout: "86400s", // 1 day
		Steps: []*cloudbuild.BuildStep{
			{
				Name: fmt.Sprintf("us.gcr.io/%s/reearth-cms-decompressor", project),
				Args: []string{"-v", "-n=192", "-gc=5000", "-chunk=1m", "-disk-limit=20g", "-gzip-ext=gml", src, dest},
				Env: []string{
					"GOOGLE_CLOUD_PROJECT=" + project,
					"REEARTH_CMS_DECOMPRESSOR_TOPIC=" + "decompress",
					"REEARTH_CMS_DECOMPRESSOR_ASSET_ID=" + p.DecompressAsset.AssetID,
				},
			},
		},
		Options: &cloudbuild.BuildOptions{
			MachineType: "E2_HIGHCPU_8",
		},
	}

	if region != "" {
		call := cb.Projects.Locations.Builds.Create(path.Join("projects", project, "locations", region), build)
		_, err = call.Do()
	} else {
		call := cb.Projects.Builds.Create(project, build)
		_, err = call.Do()
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (t *TaskRunner) runPubSub(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return nil
	}

	u, err := url.Parse(t.conf.GCSHost)
	if err != nil {
		return fmt.Errorf("failed to parse GCS host as a URL: %w", err)
	}

	var urlFn asset.URLResolver = func(a *asset.Asset) string {
		return getURL(u, a.UUID(), a.FileName())
	}

	data, err := marshalWebhookData(p.Webhook, urlFn)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	topic := t.pubsub.Topic(t.conf.Topic)
	result := topic.Publish(ctx, &pubsub.Message{
		Data: data,
	})
	log.Infof("webhook request has been sent: body %#v", p.Webhook.Payload().Webhook)

	if _, err := result.Get(ctx); err != nil {
		return rerror.ErrInternalBy(err)
	}

	return nil
}

// setClient is intended to be used for testing to inject client from external
func (t *TaskRunner) setClient(c *cloudtasks.Client) { //nolint:unused
	t.c = c
}

// CloseConn is the function to close cloudtasks Client's connection. We expect this function is prepared for interactive connection since GCP SDK uses gRPC internally. To avoid instantiate client everytime, we keep the client's instance.
func (t *TaskRunner) Close() error {
	return t.c.Close()
}

func (t *TaskRunner) createTask(ctx context.Context, req *taskspb.CreateTaskRequest, opts ...gax.CallOption) (*taskspb.Task, error) {
	return t.c.CreateTask(ctx, req, opts...)
}

func (t *TaskRunner) buildRequest(url string, message []byte) *taskspb.CreateTaskRequest {
	return &taskspb.CreateTaskRequest{
		Parent: t.queuePath,
		Task: &taskspb.Task{
			MessageType: &taskspb.Task_HttpRequest{
				HttpRequest: &taskspb.HttpRequest{
					HttpMethod: taskspb.HttpMethod_POST,
					Headers:    map[string]string{"Content-Type": "application/json"},
					Url:        url,
					Body:       message,
				},
			},
			DispatchDeadline: &durationpb.Duration{Seconds: t.conf.Timeout},
		},
	}
}

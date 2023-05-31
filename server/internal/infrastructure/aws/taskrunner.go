package aws

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sns"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

type TaskRunner struct {
	queueURL  string
	topicARN  string
	sqsClient *sqs.Client
	snsClient *sns.Client
}

func NewTaskRunner(ctx context.Context, conf *TaskConfig) (gateway.TaskRunner, error) {
	if conf.QueueURL == "" || conf.TopicARN == "" {
		return nil, errors.New("Missing configuration")
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}

	sqsClient := sqs.NewFromConfig(cfg)
	snsClient := sns.NewFromConfig(cfg)

	return &TaskRunner{
		queueURL:  conf.QueueURL,
		topicARN:  conf.TopicARN,
		sqsClient: sqsClient,
		snsClient: snsClient,
	}, nil
}

// Run implements gateway.TaskRunner
func (t *TaskRunner) Run(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return t.runTaskReq(ctx, p)
	}
	return t.runWebhookReq(ctx, p)
}

func (t *TaskRunner) runTaskReq(ctx context.Context, p task.Payload) error {
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

	_, err = t.snsClient.Publish(ctx, &sns.PublishInput{
		Message:  aws.String(string(bPayload)),
		TopicArn: aws.String(t.topicARN),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	log.Infof("task request has been sent: body %#v", p.DecompressAsset.Payload().DecompressAsset)

	return nil
}

func (t *TaskRunner) runWebhookReq(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return nil
	}

	var urlFn asset.URLResolver = func(a *asset.Asset) string {
		return getURL(s3AssetBasePath, a.UUID(), a.FileName())
	}

	data, err := marshalWebhookData(p.Webhook, urlFn)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	_, err = t.snsClient.Publish(ctx, &sns.PublishInput{
		Message:  aws.String(string(data)),
		TopicArn: aws.String(t.topicARN),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	log.Infof("webhook request has been sent: body %#v", p.Webhook.Payload().Webhook)

	return nil
}

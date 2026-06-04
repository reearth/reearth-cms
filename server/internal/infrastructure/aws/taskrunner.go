package aws

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sns"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

type TaskRunner struct {
	topicARN   string
	webhookARN string
	snsClient  *sns.Client
}

type TaskConfig struct {
	TopicARN    string
	WebhookARN  string
	NotifyToken string
}

func NewTaskRunner(ctx context.Context, conf *TaskConfig) (gateway.TaskRunner, error) {
	if conf.WebhookARN == "" || conf.TopicARN == "" {
		return nil, errors.New("missing configuration")
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}

	snsClient := sns.NewFromConfig(cfg)

	return &TaskRunner{
		webhookARN: conf.WebhookARN,
		topicARN:   conf.TopicARN,
		snsClient:  snsClient,
	}, nil
}

// Run implements gateway.TaskRunner
func (t *TaskRunner) Run(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return t.runTaskReq(ctx, p)
	}
	return t.runWebhookReq(ctx, p)
}

func (t *TaskRunner) Retry(ctx context.Context, id string) error {
	return errors.New("not implemented")
}

// HealthCheck implements gateway.TaskRunner
func (t *TaskRunner) HealthCheck(ctx context.Context) error {
	if t == nil {
		return errors.New("task runner is nil")
	}
	if t.snsClient == nil {
		return errors.New("sns client is not initialized")
	}
	if t.topicARN == "" {
		return errors.New("topic ARN is not configured")
	}
	if t.webhookARN == "" {
		return errors.New("webhook ARN is not configured")
	}
	if err := t.checkTopic(ctx, t.topicARN); err != nil {
		return err
	}
	if err := t.checkTopic(ctx, t.webhookARN); err != nil {
		return err
	}
	return nil
}

func (t *TaskRunner) checkTopic(ctx context.Context, topicARN string) error {
	_, err := t.snsClient.GetTopicAttributes(ctx, &sns.GetTopicAttributesInput{
		TopicArn: aws.String(topicARN),
	})
	if err != nil {
		return rerror.ErrInternalBy(fmt.Errorf("SNS topic %s is inaccessible: %w", topicARN, err))
	}
	return nil
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

	log.Infofc(ctx, "task request has been sent: body %#v", p.DecompressAsset.Payload().DecompressAsset)

	return nil
}

func (t *TaskRunner) runWebhookReq(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return nil
	}

	data, err := marshalWebhookData(p.Webhook)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	_, err = t.snsClient.Publish(ctx, &sns.PublishInput{
		Message:  aws.String(string(data)),
		TopicArn: aws.String(t.webhookARN),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	log.Infofc(ctx, "webhook request has been sent: body %#v", p.Webhook.Payload().Webhook)

	return nil
}

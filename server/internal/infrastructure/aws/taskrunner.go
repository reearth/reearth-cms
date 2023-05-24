package aws

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"

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
	conf      *TaskConfig
	queueURL  string
	sqsClient *sqs.Client
	snsClient *sns.Client
}

func NewTaskRunner(ctx context.Context, conf *TaskConfig) (gateway.TaskRunner, error) {
	if conf.AWSRegion == "" || conf.QueueName == "" {
		return nil, errors.New("Missing configuration")
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}
	cfg.Region = conf.AWSRegion

	sqsClient := sqs.NewFromConfig(cfg)
	snsClient := sns.NewFromConfig(cfg)

	queueURL, err := getSQSQueueURL(ctx, sqsClient, conf.QueueName)
	if err != nil {
		return nil, err
	}

	return &TaskRunner{
		conf:      conf,
		queueURL:  queueURL,
		sqsClient: sqsClient,
		snsClient: snsClient,
	}, nil
}

// Run implements gateway.TaskRunner
func (t *TaskRunner) Run(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return t.runSQS(ctx, p)
	}
	return t.runSNS(ctx, p)
}

func (t *TaskRunner) runSQS(ctx context.Context, p task.Payload) error {
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

	_, err = t.sqsClient.SendMessage(ctx, &sqs.SendMessageInput{
		MessageBody:            aws.String(string(bPayload)),
		QueueUrl:               aws.String(t.queueURL),
		MessageGroupId:         aws.String("reearth-cms"),
		MessageDeduplicationId: aws.String(fmt.Sprintf("%s-%s", p.CompressAsset.AssetID, p.DecompressAsset.AssetID)),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	log.Infof("task request has been sent: body %#v", p.DecompressAsset.Payload().DecompressAsset)

	return nil
}

func (t *TaskRunner) runSNS(ctx context.Context, p task.Payload) error {
	if p.Webhook == nil {
		return nil
	}

	u, err := url.Parse(t.conf.S3Host)
	if err != nil {
		return fmt.Errorf("failed to parse S3 host as a URL: %w", err)
	}

	var urlFn asset.URLResolver = func(a *asset.Asset) string {
		return getURL(u.Hostname(), a.UUID(), a.FileName())
	}

	data, err := marshalWebhookData(p.Webhook, urlFn)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	_, err = t.snsClient.Publish(ctx, &sns.PublishInput{
		Message:  aws.String(string(data)),
		TopicArn: aws.String(t.conf.TopicARN),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	log.Infof("webhook request has been sent: body %#v", p.Webhook.Payload().Webhook)

	return nil
}

// Close is the function to close the AWS clients. It should be called when done using the TaskRunner.
func (t *TaskRunner) Close() error {
	return nil // No specific cleanup needed for the AWS SDK v2
}

// getSQSQueueURL retrieves the SQS queue URL based on the provided queue name.
func getSQSQueueURL(ctx context.Context, sqsClient *sqs.Client, queueName string) (string, error) {
	resp, err := sqsClient.GetQueueUrl(ctx, &sqs.GetQueueUrlInput{
		QueueName: aws.String(queueName),
	})
	if err != nil {
		return "", err
	}
	return *resp.QueueUrl, nil
}

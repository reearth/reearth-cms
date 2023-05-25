package aws

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sns"
	"github.com/reearth/reearth-cms/worker/pkg/asset"
	"github.com/reearth/reearthx/log"
)

type SNS struct {
	topicArn string
}

func NewSNS(topicArn string) *SNS {
	return &SNS{
		topicArn: topicArn,
	}
}

func (s *SNS) NotifyAssetDecompressed(ctx context.Context, assetID string, status *asset.ArchiveExtractionStatus) error {
	sess, err := session.NewSession(
		&aws.Config{
			Region: aws.String("us-east-1"),
		},
	)
	if err != nil {
		return err
	}

	snsClient := sns.New(sess)

	message := map[string]string{
		"type":    "assetDecompressed",
		"assetId": assetID,
		"status":  status.String(),
	}

	body, err := json.Marshal(message)
	if err != nil {
		return err
	}

	publishInput := &sns.PublishInput{
		Message:  aws.String(string(body)),
		TopicArn: aws.String(s.topicArn),
	}

	_, err = snsClient.Publish(publishInput)
	if err != nil {
		return err
	}

	log.Infof("decompress notified via SNS: Msg=%s", string(body))
	return nil
}

package gcp

import (
	"context"
	"encoding/json"

	"cloud.google.com/go/pubsub"
	"github.com/samber/lo"
)

type PubSub struct {
	topic   string
	project string
}

func NewPubSub(topic, project string) *PubSub {
	return &PubSub{
		topic:   topic,
		project: project,
	}
}

func (c *PubSub) NotifyAssetDecompressed(ctx context.Context, assetID string) error {
	body := lo.Must(json.Marshal(map[string]string{
		"type":    "assetDecompressed",
		"assetId": assetID,
	}))

	client, err := pubsub.NewClient(ctx, c.project)
	if err != nil {
		return err
	}

	t := client.Topic(c.topic)
	result := t.Publish(ctx, &pubsub.Message{
		Data: body,
	})

	if _, err := result.Get(ctx); err != nil {
		return err
	}
	return nil
}

package gcp

import (
	"encoding/json"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	integration "github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearthx/util"
)

type webhookData struct {
	URL       string    `json:"url"`
	Secret    string    `json:"secret"`
	Timestamp time.Time `json:"timestamp"`
	EventID   string    `json:"eventId"`
	EventType string    `json:"type"`
	EventData any       `json:"data"`
}

func marshalWebhookData(w *task.WebhookPayload, urlResolver asset.URLResolver) ([]byte, error) {
	ed, err := integration.MarshalJSON(w.Event.Object(), "", urlResolver)
	if err != nil {
		return nil, err
	}

	d := webhookData{
		URL:       w.Webhook.URL().String(),
		Secret:    w.Webhook.Secret(),
		Timestamp: util.Now(),
		EventID:   w.Event.ID().String(),
		EventType: string(w.Event.Type()),
		EventData: ed,
	}
	return json.Marshal(d)
}

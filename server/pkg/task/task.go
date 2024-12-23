package task

import (
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/integration"
)

type Payload struct {
	DecompressAsset *DecompressAssetPayload
	CompressAsset   *CompressAssetPayload
	Webhook         *WebhookPayload
	Copy            *CopyPayload
}

type DecompressAssetPayload struct {
	AssetID string
	Path    string
}

func (t *DecompressAssetPayload) Payload() Payload {
	return Payload{
		DecompressAsset: t,
	}
}

type CompressAssetPayload struct {
	AssetID string
}

func (t *CompressAssetPayload) Payload() Payload {
	return Payload{
		CompressAsset: t,
	}
}

type WebhookPayload struct {
	Webhook  *integration.Webhook
	Event    *event.Event[any]
	Override any
}

func (t WebhookPayload) Payload() Payload {
	return Payload{
		Webhook: &t,
	}
}

type CopyPayload struct {
	Collection string
	Filter     string
	Changes    string
}

func (p *CopyPayload) Payload() Payload {
	return Payload{
		Copy: p,
	}
}

func (p *CopyPayload) Validate() bool {
	return p != nil && p.Changes != "" && p.Collection != "" && p.Filter != ""
}

type Changes map[string]Change
type Change struct {
	Type  ChangeType
	Value string
}
type ChangeType string

const (
	ChangeTypeSet ChangeType = "set"
	ChangeTypeNew ChangeType = "new"
)

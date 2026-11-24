package task

import (
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	sharedtask "github.com/reearth/reearth-cms/shared/task"
)

type Payload struct {
	DecompressAsset *DecompressAssetPayload
	CompressAsset   *CompressAssetPayload
	Webhook         *WebhookPayload
	Copy            *CopyPayload
	Import          *ImportPayload
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

// The copy changes are shared with the worker; see the shared/task package.
type Changes = sharedtask.Changes
type Change = sharedtask.Change
type ChangeType = sharedtask.ChangeType

const (
	ChangeTypeSet  = sharedtask.ChangeTypeSet
	ChangeTypeNew  = sharedtask.ChangeTypeNew
	ChangeTypeULID = sharedtask.ChangeTypeULID
)

type ImportPayload struct {
	UserId           string
	IntegrationId    string
	ModelId          string
	AssetId          string
	Format           string
	GeometryFieldKey string
	Strategy         string
	MutateSchema     bool
}

func (p *ImportPayload) Validate() bool {
	if p == nil {
		return false
	}
	if p.UserId == "" && p.IntegrationId == "" {
		return false
	}
	if p.ModelId == "" || p.AssetId == "" || p.Format == "" || p.Strategy == "" {
		return false
	}
	if strings.ToLower(p.Format) == "geojson" && p.GeometryFieldKey == "" {
		return false
	}
	return true
}

func (p *ImportPayload) Payload() Payload {
	return Payload{
		Import: p,
	}
}

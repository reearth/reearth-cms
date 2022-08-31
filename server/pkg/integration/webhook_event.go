package integration

type WebhookEvent struct {
	modelId     ModelID
	onCreate    bool
	onUpdate    bool
	onDelete    bool
	onApiAccess bool
}

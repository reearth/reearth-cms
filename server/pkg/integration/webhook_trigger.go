package integration

type WebhookTrigger struct {
	onItemCreate    bool
	onItemUpdate    bool
	onItemDelete    bool
	onAssetUpload   bool
	onAssetDeleted  bool
	onItemPublish   bool
	onItemUnPublish bool
}

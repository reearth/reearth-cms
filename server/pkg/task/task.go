package task

type Payload struct {
	DecompressAsset *DecompressAssetPayload
	CompressAsset   *CompressAssetPayload
}

type DecompressAssetPayload struct {
	// Asset id.AssetID TODO: comment out after Asset has been implemented
	Asset string
}

func (t *DecompressAssetPayload) Payload() Payload {
	return Payload{
		DecompressAsset: t,
	}
}

type CompressAssetPayload struct {
	// Asset id.AssetID TODO: same as above
	Asset string
}

func (t *CompressAssetPayload) Payload() Payload {
	return Payload{
		CompressAsset: t,
	}
}

func NewDecompressAssetPayloadForTest(aID string) *DecompressAssetPayload {
	return &DecompressAssetPayload{Asset: aID}
}

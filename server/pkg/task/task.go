package task

type Payload struct {
	DecompressAsset *DecompressAssetPayload
	CompressAsset   *CompressAssetPayload
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

func NewDecompressAssetPayloadForTest(aID string) *DecompressAssetPayload {
	return &DecompressAssetPayload{AssetID: aID}
}

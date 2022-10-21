package task

type Payload struct {
	DecompressAsset *DecompressAssetPayload
	CompressAsset   *CompressAssetPayload
}

type DecompressAssetPayload struct {
	Asset string
	Path  string
}

func (t *DecompressAssetPayload) Payload() Payload {
	return Payload{
		DecompressAsset: t,
	}
}

type CompressAssetPayload struct {
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

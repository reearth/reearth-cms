package task

type Payload struct {
	DecompressAsset *DecompressAssetPayload
	CompressAsset   *CompressAssetPayload
}

type DecompressAssetPayload struct {
	// Asset id.AssetID TODO: comment out after asset has been implemented
}

func (t *DecompressAssetPayload) Payload() Payload {
	return Payload{
		DecompressAsset: t,
	}
}

type CompressAssetPayload struct {
	// Asset id.AssetID TODO: same as above
}

func (t *CompressAssetPayload) Payload() Payload {
	return Payload{
		CompressAsset: t,
	}
}

type CompressZipPayload struct {
	// Asset id.AssetID TODO: same as above
}

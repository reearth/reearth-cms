package gcp

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/stretchr/testify/require"
)

func TestTaskRunner(t *testing.T) {
	assetID := ""
	path := ""
	gcsBucket := ""
	gcpProject := ""
	gcpRegion := ""
	decompressorImage := ""
	copierImage := ""

	if assetID == "" || path == "" || gcsBucket == "" || gcpProject == "" || gcpRegion == "" {
		t.Skip("assetID, path, gcsBucket, gcpProject, gcpRegion must be set")
	}

	task := task.Payload{
		DecompressAsset: &task.DecompressAssetPayload{
			AssetID: assetID,
			Path:    path,
		},
	}

	ctx := context.Background()
	tr, err := NewTaskRunner(ctx, &TaskConfig{
		GCPProject:          gcpProject,
		GCPRegion:           gcpRegion,
		GCSBucket:           gcsBucket,
		DecompressorImage:   decompressorImage,
		DecompressorTopic:   "decompress",
		DecompressorGzipExt: "gml",
		CopierImage:         copierImage,
	})
	require.NoError(t, err)

	err = tr.Run(ctx, task)
	require.NoError(t, err)
}

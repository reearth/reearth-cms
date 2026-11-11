package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAssetUpload(t *testing.T) {
	t.Parallel()
	ctx := context.Background()
	r := NewAssetUpload()

	_, err := r.FindByID(ctx, "u")
	assert.ErrorIs(t, err, rerror.ErrNotFound)

	u := asset.NewUpload().UUID("u").Project(asset.NewProjectID()).FileName("a.txt").Serve(true).Build()
	require.NoError(t, r.Save(ctx, u))

	got, err := r.FindByID(ctx, "u")
	require.NoError(t, err)
	assert.Equal(t, u, got)
	assert.NotSame(t, u, got, "stored uploads must be copies")
}

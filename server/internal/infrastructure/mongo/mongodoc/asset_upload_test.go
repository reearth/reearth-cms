package mongodoc

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAssetUploadDocument_RoundTrip(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		serve bool
	}{
		{name: "legacy upload", serve: false},
		{name: "serve upload", serve: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			u := asset.NewUpload().
				UUID("u").
				Project(id.NewProjectID()).
				FileName("a.txt").
				ExpiresAt(time.Date(2030, 1, 1, 0, 0, 0, 0, time.UTC)).
				ContentLength(1).
				ContentType("text/plain").
				ContentEncoding("gzip").
				Serve(tt.serve).
				Build()

			doc := NewAssetUpload(u)
			assert.Equal(t, tt.serve, doc.Serve)

			got, err := doc.Model()
			require.NoError(t, err)
			assert.Equal(t, u, got)
		})
	}
}

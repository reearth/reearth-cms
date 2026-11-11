package asset

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestUpload_Upload(t *testing.T) {
	t.Parallel()
	projectID := NewProjectID()
	timeNow := time.Now()
	uploadWithData := &Upload{
		uuid:          "1",
		project:       projectID,
		fileName:      "file.test",
		contentLength: int64(1),
		expiresAt:     timeNow,
	}

	assert.Equal(t, "1", uploadWithData.UUID())
	assert.Equal(t, projectID, uploadWithData.Project())
	assert.Equal(t, "file.test", uploadWithData.FileName())
	assert.Equal(t, int64(1), uploadWithData.ContentLength())
	assert.Equal(t, false, uploadWithData.Expired(timeNow))
	assert.Equal(t, timeNow, uploadWithData.ExpiresAt())
}

func TestUpload_StoredInServe(t *testing.T) {
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
			u := NewUpload().UUID("u").Serve(tt.serve).Build()
			assert.Equal(t, tt.serve, u.StoredInServe())
		})
	}
}

func TestUpload_Clone(t *testing.T) {
	t.Parallel()

	assert.Nil(t, (*Upload)(nil).Clone())

	u := NewUpload().UUID("u").Project(NewProjectID()).FileName("a.txt").ExpiresAt(time.Now()).ContentLength(1).ContentType("text/plain").ContentEncoding("gzip").Serve(true).Build()
	c := u.Clone()
	assert.Equal(t, u, c)
	assert.NotSame(t, u, c)
}

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

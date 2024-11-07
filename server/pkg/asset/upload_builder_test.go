package asset

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestUploadBuilder_NewUpload(t *testing.T) {
	ub := &UploadBuilder{
		u: &Upload{},
	}
	assert.Equal(t, ub, NewUpload())

	projectID := NewProjectID()
	ubWithData := &UploadBuilder{
		u: &Upload{
			uuid:          "1",
			project:       projectID,
			fileName:      "file.test",
			contentLength: int64(1),
			expiresAt:     time.Now(),
		},
	}

	timeNow := time.Now
	assert.Equal(t, ubWithData, ubWithData.UUID("1"))
	assert.Equal(t, ubWithData, ubWithData.Project(projectID))
	assert.Equal(t, ubWithData, ubWithData.FileName("file.test"))
	assert.Equal(t, ubWithData, ubWithData.ContentLength(int64(1)))
	assert.Equal(t, ubWithData, ubWithData.ExpiresAt(timeNow()))
	assert.Equal(t, ubWithData.u, ubWithData.Build())
}

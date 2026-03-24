package gateway

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestIssueUploadAssetParam_GetOrGuessContentType(t *testing.T) {
	tests := []struct {
		name   string
		fields IssueUploadAssetParam
		want   string
	}{
		{
			name: "zip file",
			fields: IssueUploadAssetParam{
				UUID:          uuid.New().String(),
				Filename:      "filename.zip",
				ContentLength: 1,
				ExpiresAt:     time.Now(),
				Cursor:        "",
			},
			want: "application/zip",
		},
		{
			name: "7zip file",
			fields: IssueUploadAssetParam{
				UUID:          uuid.New().String(),
				Filename:      "filename.7z",
				ContentLength: 1,
				ExpiresAt:     time.Now(),
				Cursor:        "",
			},
			want: "application/x-7z-compressed",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.fields.GetOrGuessContentType())
		})
	}
}

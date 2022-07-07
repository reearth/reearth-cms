package asset

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestBuilder_Build(t *testing.T) {
	var aid ID = NewID()
	pid := NewProjectID()
	uid := NewUserID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15
	tests := []struct {
		name  string
		input struct {
			id        ID
			projectID ProjectID
			createdAt time.Time
			createdBy UserID
			fileName  string
			assetType string
			size      uint64
		}
		want struct {
			asset *Asset
			err   bool
		}
	}{
		{
			name: "should create an asset",
			input: struct {
				id        ID
				projectID ProjectID
				createdAt time.Time
				createdBy UserID
				fileName  string
				assetType string
				size      uint64
			}{
				id:        aid,
				projectID: pid,
				createdAt: tim,
				createdBy: uid,
				fileName:  "hoge",
				assetType: "xxx",
				size:      size,
			},
			want: struct {
				asset *Asset
				err   bool
			}{
				asset: &Asset{
					id:        aid,
					projectID: pid,
					createdBy: uid,
					createdAt: tim,
					fileName:  "hoge",
					assetType: "xxx",
					size:      size,
				},
			},
		},
		{
			name: "fail: empty project id",
			input: struct {
				id        ID
				projectID ProjectID
				createdAt time.Time
				createdBy UserID
				fileName  string
				assetType string
				size      uint64
			}{
				id:        aid,
				createdBy: uid,
				fileName:  "hoge",
				assetType: "xxx",
				size:      size,
			},
			want: struct {
				asset *Asset
				err   bool
			}{
				err: true,
			},
		},
		{
			name: "fail: empty id",
			input: struct {
				id        ID
				projectID ProjectID
				createdAt time.Time
				createdBy UserID
				fileName  string
				assetType string
				size      uint64
			}{
				projectID: pid,
				createdBy: uid,
				fileName:  "hoge",
				assetType: "xxx",
				size:      size,
			},
			want: struct {
				asset *Asset
				err   bool
			}{
				err: true,
			},
		},
		{
			name: "should create asset with id timestamp",
			input: struct {
				id        ID
				projectID ProjectID
				createdAt time.Time
				createdBy UserID
				fileName  string
				assetType string
				size      uint64
			}{
				id:        aid,
				projectID: pid,
				createdBy: uid,
				fileName:  "hoge",
				assetType: "xxx",
				size:      size,
			},
			want: struct {
				asset *Asset
				err   bool
			}{
				asset: &Asset{
					id:        aid,
					projectID: pid,
					createdBy: uid,
					createdAt: aid.Timestamp(),
					fileName:  "hoge",
					assetType: "xxx",
					size:      size,
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := New().
				ID(tt.input.id).
				FileName(tt.input.fileName).
				CreatedBy(tt.input.createdBy).
				CreatedAt(tt.input.createdAt).
				Project(tt.input.projectID).
				Type(tt.input.assetType).
				Size(tt.input.size).
				Build()
			if (err == nil) != tt.want.err {
				assert.Equal(t, tt.want.asset, got)
			}
		})
	}
}

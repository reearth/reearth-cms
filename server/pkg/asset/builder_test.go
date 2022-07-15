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
	type input struct {
		id        ID
		projectID ProjectID
		createdAt time.Time
		createdBy UserID
		fileName  string
		assetType string
		size      uint64
		url       string
	}

	tests := []struct {
		name  string
		input input
		want  struct {
			asset *Asset
			err   bool
		}
	}{
		{
			name: "should create an asset",
			input: input{
				id:        aid,
				projectID: pid,
				createdAt: tim,
				createdBy: uid,
				fileName:  "hoge",
				assetType: "xxx",
				size:      size,
				url:       "yyy",
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
					url:       "yyy",
				},
			},
		},
		{
			name: "fail: empty project id",
			input: input{
				id:        aid,
				createdBy: uid,
				fileName:  "hoge",
				assetType: "xxx",
				size:      size,
				url:       "yyy",
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
			input: input{
				projectID: pid,
				createdBy: uid,
				fileName:  "hoge",
				assetType: "xxx",
				size:      size,
				url:       "yyy",
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
			input: input{
				id:        aid,
				projectID: pid,
				createdBy: uid,
				fileName:  "hoge",
				assetType: "xxx",
				size:      size,
				url:       "yyy",
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
					url:       "yyy",
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
				URL(tt.input.url).
				Build()
			if (err == nil) != tt.want.err {
				assert.Equal(t, tt.want.asset, got)
			}
		})
	}
}

func TestBuilder_MustBuild(t *testing.T) {
	var aid ID = NewID()
	pid := NewProjectID()
	uid := NewUserID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15
	type input struct {
		id        ID
		projectID ProjectID
		createdAt time.Time
		createdBy UserID
		fileName  string
		assetType string
		size      uint64
		url       string
	}

	tests := []struct {
		name     string
		input    input
		expected *Asset
		err      error
	}{
		{
			name: "Valid asset",
			input: input{
				id:        aid,
				projectID: pid,
				createdAt: tim,
				createdBy: uid,
				fileName:  "hoge",
				assetType: "xxx",
				size:      size,
				url:       "yyy",
			},
			expected: &Asset{
				id:        aid,
				projectID: pid,
				createdAt: tim,
				createdBy: uid,
				fileName:  "hoge",
				assetType: "xxx",
				size:      size,
				url:       "yyy",
			},
		},
		{
			name: "failed invalid Id",
			input: input{
				id:        ID{},
				projectID: pid,
				createdAt: tim,
				createdBy: uid,
				fileName:  "hoge",
				assetType: "xxx",
				size:      size,
				url:       "yyy",
			},
			err: ErrInvalidID,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			build := func() *Asset {
				t.Helper()
				return New().
					ID(tt.input.id).
					Project(tt.input.projectID).
					CreatedAt(tt.input.createdAt).
					CreatedBy(tt.input.createdBy).
					FileName(tt.input.fileName).
					Type(tt.input.assetType).
					Size(tt.input.size).
					URL(tt.input.url).
					MustBuild()
			}
			if tt.err != nil {
				assert.PanicsWithValue(t, tt.err, func() { _ = build() })
			} else {
				assert.Equal(t, tt.expected, build())
			}
		})
	}
}

func TestBuilder_NewID(t *testing.T) {
	pid := NewProjectID()
	a := New().NewID().Project(pid).MustBuild()
	assert.False(t, a.id.IsNil())
}

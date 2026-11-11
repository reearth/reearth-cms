package gateway

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

type stubFile struct {
	File
	base string
}

func (s *stubFile) GetAccessInfo(a *asset.Asset) *asset.AccessInfo {
	return &asset.AccessInfo{Url: s.base + "/" + a.FileName()}
}

func TestContainer_AssetFile(t *testing.T) {
	t.Parallel()

	legacy := &stubFile{base: "legacy"}
	serve := &stubFile{base: "serve"}
	b := func() *asset.Builder {
		return asset.New().NewID().Project(asset.NewProjectID()).CreatedByUser(asset.NewUserID()).Size(1).FileName("a.txt")
	}
	legacyAsset := b().UUID("uuid-1").MustBuild()
	migratedAsset := b().UUID("uuid-2").ServeID(lo.ToPtr("serve-2")).MustBuild()
	serveAsset := b().ServeID(lo.ToPtr("serve-3")).MustBuild()

	tests := []struct {
		name      string
		container *Container
		asset     *asset.Asset
		wantFile  File
		wantKey   string
		wantURL   string
		wantErr   error
	}{
		{name: "legacy asset", container: &Container{File: legacy, ServeFile: serve}, asset: legacyAsset, wantFile: legacy, wantKey: "uuid-1", wantURL: "legacy/a.txt"},
		{name: "migrated asset", container: &Container{File: legacy, ServeFile: serve}, asset: migratedAsset, wantFile: serve, wantKey: "serve-2", wantURL: "serve/a.txt"},
		{name: "serve asset", container: &Container{File: legacy, ServeFile: serve}, asset: serveAsset, wantFile: serve, wantKey: "serve-3", wantURL: "serve/a.txt"},
		{name: "legacy asset without serve", container: &Container{File: legacy}, asset: legacyAsset, wantFile: legacy, wantKey: "uuid-1", wantURL: "legacy/a.txt"},
		{name: "serve asset without serve", container: &Container{File: legacy}, asset: serveAsset, wantErr: ErrServeNotConfigured},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			f, key, err := tt.container.AssetFile(tt.asset)
			assert.Equal(t, tt.wantErr, err)
			if tt.wantFile == nil {
				assert.Nil(t, f)
			} else {
				assert.Same(t, tt.wantFile, f)
			}
			assert.Equal(t, tt.wantKey, key)

			ai := tt.container.AssetAccessInfoResolver()(tt.asset)
			if tt.wantURL == "" {
				assert.Nil(t, ai)
				return
			}
			assert.Equal(t, tt.wantURL, ai.Url)
		})
	}
}

func TestContainer_AssetUploadFile(t *testing.T) {
	t.Parallel()

	legacy := &stubFile{base: "legacy"}
	serve := &stubFile{base: "serve"}

	tests := []struct {
		name      string
		container *Container
		wantFile  File
		wantServe bool
	}{
		{name: "legacy by default", container: &Container{File: legacy, ServeFile: serve}, wantFile: legacy},
		{name: "serve when enabled", container: &Container{File: legacy, ServeFile: serve, ServeUpload: true}, wantFile: serve, wantServe: true},
		{name: "legacy when serve is not configured", container: &Container{File: legacy, ServeUpload: true}, wantFile: legacy},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f, toServe := tt.container.AssetUploadFile()
			assert.Same(t, tt.wantFile, f)
			assert.Equal(t, tt.wantServe, toServe)
		})
	}
}

package interactor

import (
	"context"
	"io"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// recordingFile records which keys each asset storage was called with.
type recordingFile struct {
	gateway.File
	name string

	mu       sync.Mutex
	read     []string
	deleted  []string
	uploaded []*file.File
	issued   []gateway.IssueUploadAssetParam
	finished []string
}

// serveUploadExpiry is the upload expiry the "serve" recordingFile reports.
var serveUploadExpiry = time.Date(2030, 1, 1, 0, 0, 0, 0, time.UTC)

func (f *recordingFile) IssueUploadAssetLink(_ context.Context, p gateway.IssueUploadAssetParam) (*gateway.UploadAssetLink, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.issued = append(f.issued, p)
	l := &gateway.UploadAssetLink{URL: f.name + "/upload", ContentLength: p.ContentLength, UUID: p.UUID, ExpiresAt: p.ExpiresAt}
	if f.name == "serve" {
		// reearth-serve assigns its own upload ID and expiry.
		l.UUID = "serve-upload"
		l.ExpiresAt = serveUploadExpiry
		l.ContentEncoding = "gzip"
	}
	return l, nil
}

func (f *recordingFile) UploadedAsset(_ context.Context, u *asset.Upload) (*file.File, string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.finished = append(f.finished, u.UUID())
	key := u.UUID()
	if f.name == "serve" {
		key = "serve-key"
	}
	return &file.File{Name: u.FileName(), Size: u.ContentLength()}, key, nil
}

func (f *recordingFile) UploadAsset(_ context.Context, fl *file.File) (string, int64, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.uploaded = append(f.uploaded, fl)
	return f.name + "-key", fl.Size, nil
}

func (f *recordingFile) ReadAsset(_ context.Context, key, fn string, _ map[string]string) (io.ReadCloser, map[string]string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.read = append(f.read, key+"/"+fn)
	return io.NopCloser(strings.NewReader(f.name)), nil, nil
}

func (f *recordingFile) DeleteAsset(_ context.Context, key, _ string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deleted = append(f.deleted, key)
	return nil
}

func (f *recordingFile) DeleteAssets(_ context.Context, keys []string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deleted = append(f.deleted, keys...)
	return nil
}

func (f *recordingFile) GetAccessInfo(a *asset.Asset) *asset.AccessInfo {
	return &asset.AccessInfo{Url: f.name + "/" + a.FileName()}
}

func (f *recordingFile) GetAccessInfoResolver() asset.AccessInfoResolver {
	return f.GetAccessInfo
}

type assetStorageFixture struct {
	ctx    context.Context
	uc     *Asset
	op     *usecase.Operator
	prj    *project.Project
	legacy *recordingFile
	serve  *recordingFile

	legacyAsset   *asset.Asset
	migratedAsset *asset.Asset
	serveAsset    *asset.Asset
}

func newAssetStorageFixture(t *testing.T, withServe bool) *assetStorageFixture {
	t.Helper()

	ctx := context.Background()
	uid := accountdomain.NewUserID()
	ws := workspace.New().NewID().MustBuild()
	prj := project.New().NewID().Workspace(ws.ID()).MustBuild()
	b := func(fn string) *asset.Builder {
		return asset.New().NewID().Project(prj.ID()).CreatedByUser(uid).Size(1).FileName(fn).Thread(id.NewThreadID().Ref())
	}

	f := &assetStorageFixture{
		ctx:           ctx,
		legacy:        &recordingFile{name: "legacy"},
		serve:         &recordingFile{name: "serve"},
		prj:           prj,
		legacyAsset:   b("legacy.txt").UUID("uuid-1").MustBuild(),
		migratedAsset: b("migrated.txt").UUID("uuid-2").ServeID(lo.ToPtr("serve-2")).MustBuild(),
		serveAsset:    b("serve.txt").ServeID(lo.ToPtr("serve-3")).MustBuild(),
		op: &usecase.Operator{
			AcOperator:     &accountusecase.Operator{User: &uid, OwningWorkspaces: []accountdomain.WorkspaceID{ws.ID()}},
			OwningProjects: []id.ProjectID{prj.ID()},
		},
	}

	db := memory.New()
	require.NoError(t, db.Project.Save(ctx, prj))
	for _, a := range []*asset.Asset{f.legacyAsset, f.migratedAsset, f.serveAsset} {
		require.NoError(t, db.Asset.Save(ctx, a.Clone()))
	}

	g := &gateway.Container{File: f.legacy}
	if withServe {
		g.ServeFile = f.serve
	}
	f.uc = &Asset{repos: db, gateways: g, ignoreEvent: true}
	return f
}

func TestAsset_DownloadByID_Storage(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		asset    func(*assetStorageFixture) *asset.Asset
		wantBody string
		wantRead string
	}{
		{name: "legacy asset reads from legacy storage", asset: func(f *assetStorageFixture) *asset.Asset { return f.legacyAsset }, wantBody: "legacy", wantRead: "uuid-1/legacy.txt"},
		{name: "migrated asset reads from serve by serve id", asset: func(f *assetStorageFixture) *asset.Asset { return f.migratedAsset }, wantBody: "serve", wantRead: "serve-2/migrated.txt"},
		{name: "serve asset reads from serve", asset: func(f *assetStorageFixture) *asset.Asset { return f.serveAsset }, wantBody: "serve", wantRead: "serve-3/serve.txt"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f := newAssetStorageFixture(t, true)

			r, _, err := f.uc.DownloadByID(f.ctx, tt.asset(f).ID(), nil, f.op)
			require.NoError(t, err)
			b, _ := io.ReadAll(r)
			assert.Equal(t, tt.wantBody, string(b))
			assert.Equal(t, []string{tt.wantRead}, append(f.legacy.read, f.serve.read...))
		})
	}
}

func TestAsset_DownloadByID_ServeNotConfigured(t *testing.T) {
	t.Parallel()
	f := newAssetStorageFixture(t, false)

	_, _, err := f.uc.DownloadByID(f.ctx, f.serveAsset.ID(), nil, f.op)
	assert.ErrorIs(t, err, gateway.ErrServeNotConfigured)
	assert.Empty(t, f.legacy.read, "must not fall back to legacy storage")
}

func TestAsset_FindByID_AccessInfo(t *testing.T) {
	t.Parallel()
	f := newAssetStorageFixture(t, true)

	got, err := f.uc.FindByID(f.ctx, f.legacyAsset.ID(), f.op)
	require.NoError(t, err)
	assert.Equal(t, "legacy/legacy.txt", got.AccessInfo().Url)

	got, err = f.uc.FindByID(f.ctx, f.migratedAsset.ID(), f.op)
	require.NoError(t, err)
	assert.Equal(t, "serve/migrated.txt", got.AccessInfo().Url)
}

func TestAsset_Delete_Storage(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		asset      func(*assetStorageFixture) *asset.Asset
		wantLegacy []string
		wantServe  []string
	}{
		{name: "legacy asset", asset: func(f *assetStorageFixture) *asset.Asset { return f.legacyAsset }, wantLegacy: []string{"uuid-1"}},
		{name: "migrated asset", asset: func(f *assetStorageFixture) *asset.Asset { return f.migratedAsset }, wantServe: []string{"serve-2"}},
		{name: "serve asset", asset: func(f *assetStorageFixture) *asset.Asset { return f.serveAsset }, wantServe: []string{"serve-3"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f := newAssetStorageFixture(t, true)

			_, err := f.uc.Delete(f.ctx, tt.asset(f).ID(), f.op)
			require.NoError(t, err)
			assert.Equal(t, tt.wantLegacy, f.legacy.deleted)
			assert.Equal(t, tt.wantServe, f.serve.deleted)
		})
	}
}

func TestAsset_BatchDelete_Storage(t *testing.T) {
	t.Parallel()
	f := newAssetStorageFixture(t, true)

	_, err := f.uc.BatchDelete(f.ctx, id.AssetIDList{f.legacyAsset.ID(), f.migratedAsset.ID(), f.serveAsset.ID()}, f.op)
	require.NoError(t, err)
	assert.Equal(t, []string{"uuid-1"}, f.legacy.deleted)
	assert.ElementsMatch(t, []string{"serve-2", "serve-3"}, f.serve.deleted)
}

func TestAsset_Create_Storage(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name              string
		serveUpload       bool
		fileName          string
		skipDecompression bool
		wantStorage       string
		wantUUID          string
		wantServeID       *string
		wantStatus        *asset.ArchiveExtractionStatus
	}{
		{name: "legacy upload", fileName: "a.txt", wantStorage: "legacy", wantUUID: "legacy-key", wantStatus: lo.ToPtr(asset.ArchiveExtractionStatusDone)},
		{name: "serve upload", serveUpload: true, fileName: "a.txt", wantStorage: "serve", wantServeID: lo.ToPtr("serve-key"), wantStatus: lo.ToPtr(asset.ArchiveExtractionStatusDone)},
		{name: "serve zip is extracted by serve", serveUpload: true, fileName: "a.zip", wantStorage: "serve", wantServeID: lo.ToPtr("serve-key"), wantStatus: lo.ToPtr(asset.ArchiveExtractionStatusPending)},
		{name: "serve zip with skipped extraction", serveUpload: true, fileName: "a.zip", skipDecompression: true, wantStorage: "serve", wantServeID: lo.ToPtr("serve-key"), wantStatus: lo.ToPtr(asset.ArchiveExtractionStatusSkipped)},
		{name: "serve 7z is kept as a file", serveUpload: true, fileName: "a.7z", wantStorage: "serve", wantServeID: lo.ToPtr("serve-key"), wantStatus: lo.ToPtr(asset.ArchiveExtractionStatusDone)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f := newAssetStorageFixture(t, true)
			f.uc.gateways.ServeUpload = tt.serveUpload

			a, _, err := f.uc.Create(f.ctx, interfaces.CreateAssetParam{
				ProjectID:         f.prj.ID(),
				File:              &file.File{Content: io.NopCloser(strings.NewReader("hello")), Name: tt.fileName, Size: 5},
				SkipDecompression: tt.skipDecompression,
			}, f.op)
			require.NoError(t, err)

			storage, other := f.legacy, f.serve
			if tt.wantStorage == "serve" {
				storage, other = f.serve, f.legacy
			}
			require.Len(t, storage.uploaded, 1)
			assert.Equal(t, tt.skipDecompression, storage.uploaded[0].SkipExtraction)
			assert.Empty(t, other.uploaded)

			assert.Equal(t, tt.wantUUID, a.UUID())
			assert.Equal(t, tt.wantServeID, a.ServeID())
			assert.Equal(t, tt.wantStatus, a.ArchiveExtractionStatus())

			got, err := f.uc.repos.Asset.FindByID(f.ctx, a.ID())
			require.NoError(t, err)
			assert.Equal(t, tt.wantServeID, got.ServeID())
		})
	}
}

func TestAsset_Decompress_ServeUnsupported(t *testing.T) {
	t.Parallel()
	f := newAssetStorageFixture(t, true)

	_, err := f.uc.Decompress(f.ctx, f.serveAsset.ID(), f.op)
	assert.ErrorIs(t, err, gateway.ErrUnsupportedOperation)
}

func TestAsset_CreateUpload_Storage(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		serveUpload    bool
		flipAfterIssue bool
		wantStorage    string
		wantServeID    *string
	}{
		{name: "legacy upload link", wantStorage: "legacy"},
		{name: "serve upload link", serveUpload: true, wantStorage: "serve", wantServeID: lo.ToPtr("serve-key")},
		{name: "serve upload completes on serve after serve upload is turned off", serveUpload: true, flipAfterIssue: true, wantStorage: "serve", wantServeID: lo.ToPtr("serve-key")},
		{name: "legacy upload completes on legacy after serve upload is turned on", flipAfterIssue: true, wantStorage: "legacy"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f := newAssetStorageFixture(t, true)
			f.uc.gateways.ServeUpload = tt.serveUpload

			au, err := f.uc.CreateUpload(f.ctx, interfaces.CreateAssetUploadParam{
				ProjectID:     f.prj.ID(),
				Filename:      "a.json",
				ContentLength: 10,
			}, f.op)
			require.NoError(t, err)

			storage, other := f.legacy, f.serve
			if tt.wantStorage == "serve" {
				storage, other = f.serve, f.legacy
			}
			require.Len(t, storage.issued, 1)
			assert.Empty(t, other.issued)
			assert.Equal(t, tt.wantStorage+"/upload", au.URL)

			u, err := f.uc.repos.AssetUpload.FindByID(f.ctx, au.UUID)
			require.NoError(t, err)
			assert.Equal(t, tt.wantStorage == "serve", u.StoredInServe())
			if tt.wantStorage == "serve" {
				assert.Equal(t, "serve-upload", au.UUID)
				assert.Equal(t, "gzip", au.ContentEncoding)
				assert.Equal(t, serveUploadExpiry, u.ExpiresAt())
			} else {
				assert.Equal(t, storage.issued[0].UUID, au.UUID)
				assert.Equal(t, storage.issued[0].ExpiresAt, u.ExpiresAt())
			}

			if tt.flipAfterIssue {
				f.uc.gateways.ServeUpload = !tt.serveUpload
			}

			a, _, err := f.uc.Create(f.ctx, interfaces.CreateAssetParam{ProjectID: f.prj.ID(), Token: au.UUID}, f.op)
			require.NoError(t, err)
			assert.Equal(t, []string{au.UUID}, storage.finished)
			assert.Empty(t, other.finished)
			assert.Equal(t, tt.wantServeID, a.ServeID())
			if tt.wantStorage == "serve" {
				assert.Empty(t, a.UUID())
			} else {
				assert.Equal(t, au.UUID, a.UUID())
			}
		})
	}
}

func TestAsset_Create_UploadedOnServeNotConfigured(t *testing.T) {
	t.Parallel()
	f := newAssetStorageFixture(t, false)

	u := asset.NewUpload().UUID("serve-upload").Project(f.prj.ID()).FileName("a.json").ExpiresAt(serveUploadExpiry).Serve(true).Build()
	require.NoError(t, f.uc.repos.AssetUpload.Save(f.ctx, u))

	_, _, err := f.uc.Create(f.ctx, interfaces.CreateAssetParam{ProjectID: f.prj.ID(), Token: u.UUID()}, f.op)
	assert.ErrorIs(t, err, gateway.ErrServeNotConfigured)
	assert.Empty(t, f.legacy.finished, "must not fall back to legacy storage")
}

// noIDFile issues upload links without an upload ID.
type noIDFile struct{ gateway.File }

func (noIDFile) IssueUploadAssetLink(context.Context, gateway.IssueUploadAssetParam) (*gateway.UploadAssetLink, error) {
	return &gateway.UploadAssetLink{URL: "u"}, nil
}

func TestAsset_CreateUpload_NoUploadID(t *testing.T) {
	t.Parallel()
	f := newAssetStorageFixture(t, false)
	f.uc.gateways.File = noIDFile{}

	_, err := f.uc.CreateUpload(f.ctx, interfaces.CreateAssetUploadParam{ProjectID: f.prj.ID(), Filename: "a.json", ContentLength: 10}, f.op)
	assert.True(t, rerror.IsInternal(err), "got %v", err)
}

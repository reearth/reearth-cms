package interactor

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"path"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestAsset_FindByID(t *testing.T) {
	g := gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "", false)),
	}
	pid := id.NewProjectID()
	id1 := id.NewAssetID()
	uid1 := accountdomain.NewUserID()
	a1 := asset.New().
		ID(id1).
		Project(pid).
		CreatedByUser(uid1).
		Size(1000).
		Thread(id.NewThreadID().Ref()).
		NewUUID().
		MustBuild()

	op := &usecase.Operator{}

	type args struct {
		id       id.AssetID
		operator *usecase.Operator
	}

	tests := []struct {
		name    string
		seeds   asset.List
		args    args
		want    *asset.Asset
		wantErr error
	}{
		{
			name:  "Not found in empty db",
			seeds: asset.List{},
			args: args{
				id:       id.NewAssetID(),
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "Not found",
			seeds: asset.List{a1},
			args: args{
				id:       id.NewAssetID(),
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "Found 1",
			seeds: asset.List{a1},
			args: args{
				id:       id1,
				operator: op,
			},
			want:    a1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: asset.List{
				a1,
				asset.New().
					NewID().
					Project(id.NewProjectID()).
					CreatedByUser(accountdomain.NewUserID()).
					Size(1000).
					Thread(id.NewThreadID().Ref()).
					NewUUID().
					MustBuild(),
				asset.New().
					NewID().
					Project(id.NewProjectID()).
					CreatedByUser(accountdomain.NewUserID()).
					Size(1000).
					Thread(id.NewThreadID().Ref()).
					NewUUID().
					MustBuild(),
			},
			args: args{
				id:       id1,
				operator: op,
			},
			want:    a1,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			for _, a := range tc.seeds {
				err := db.Asset.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}
			assetUC := NewAsset(db, &g, ContainerConfig{})

			got, err := assetUC.FindByID(ctx, tc.args.id, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			// assert always fails on comparing functions
			got.SetAccessInfoResolver(nil)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAsset_DecompressByID(t *testing.T) {
	g := gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "", false)),
	}
	ws1 := workspace.New().NewID().MustBuild()
	pid1 := id.NewProjectID()
	id1 := id.NewAssetID()
	uid1 := accountdomain.NewUserID()
	u1 := user.New().ID(uid1).Name("aaa").Email("aaa@bbb.com").Workspace(ws1.ID()).MustBuild()
	a1 := asset.New().
		ID(id1).
		Project(pid1).
		CreatedByUser(uid1).
		Size(1000).
		FileName("aaa.zip").
		Thread(id.NewThreadID().Ref()).
		NewUUID().
		MustBuild()

	type args struct {
		id       id.AssetID
		operator *usecase.Operator
	}

	tests := []struct {
		name    string
		seeds   asset.List
		args    args
		want    *asset.Asset
		wantErr error
	}{
		{
			name:  "No user or integration",
			seeds: asset.List{},
			args: args{
				id: id.NewAssetID(),
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{},
				},
			},
			want:    nil,
			wantErr: interfaces.ErrInvalidOperator,
		},
		{
			name:  "Operation denied",
			seeds: asset.List{a1},
			args: args{
				id: a1.ID(),
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User:               lo.ToPtr(u1.ID()),
						ReadableWorkspaces: []accountdomain.WorkspaceID{ws1.ID()},
					},
				},
			},
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:  "not found",
			seeds: asset.List{a1},
			args: args{
				id: asset.NewID(),
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User:             lo.ToPtr(u1.ID()),
						OwningWorkspaces: []accountdomain.WorkspaceID{ws1.ID()},
					},
					OwningProjects: []id.ProjectID{pid1},
				},
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			for _, a := range tc.seeds {
				err := db.Asset.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}
			assetUC := NewAsset(db, &g, ContainerConfig{})

			got, err := assetUC.Decompress(ctx, tc.args.id, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAsset_FindFileByID(t *testing.T) {
	pid := id.NewProjectID()
	id1 := id.NewAssetID()
	uid1 := accountdomain.NewUserID()
	a1 := asset.New().
		ID(id1).
		Project(pid).
		CreatedByUser(uid1).
		Size(1000).
		Thread(id.NewThreadID().Ref()).
		NewUUID().
		MustBuild()
	af1 := asset.NewFile().Name("xxx").Path("/xxx.zip").GuessContentType().Build()
	op := &usecase.Operator{}

	type args struct {
		id       id.AssetID
		operator *usecase.Operator
	}

	tests := []struct {
		name      string
		seeds     asset.List
		seedFiles map[asset.ID]*asset.File
		args      args
		want      *asset.File
		wantErr   error
	}{
		{
			name:  "Asset Not found",
			seeds: asset.List{a1},
			args: args{
				id:       asset.NewID(),
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "Asset file Not found",
			seeds: asset.List{a1},
			seedFiles: map[asset.ID]*asset.File{
				asset.NewID(): af1,
			},
			args: args{
				id:       id1,
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "Asset file found",
			seeds: asset.List{a1},
			seedFiles: map[asset.ID]*asset.File{
				id1: af1,
			},
			args: args{
				id:       id1,
				operator: op,
			},
			want:    af1,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			for _, a := range tc.seeds {
				err := db.Asset.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}
			for id, f := range tc.seedFiles {
				err := db.AssetFile.Save(ctx, id, f.Clone())
				assert.Nil(t, err)
			}

			assetUC := NewAsset(db, nil, ContainerConfig{})

			got, err := assetUC.FindFileByID(ctx, tc.args.id, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAsset_FindByIDs(t *testing.T) {
	g := gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "", false)),
	}
	pid1 := id.NewProjectID()
	uid1 := accountdomain.NewUserID()
	id1 := id.NewAssetID()
	id2 := id.NewAssetID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	a1 := asset.New().ID(id1).
		Project(pid1).
		CreatedAt(tim).
		CreatedByUser(uid1).
		Size(1000).
		Thread(id.NewThreadID().Ref()).
		NewUUID().
		MustBuild()
	a2 := asset.New().ID(id2).
		Project(pid1).
		CreatedAt(tim).
		CreatedByUser(uid1).
		Size(1000).
		Thread(id.NewThreadID().Ref()).
		NewUUID().
		MustBuild()

	tests := []struct {
		name    string
		seeds   asset.List
		arg     id.AssetIDList
		want    asset.List
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   asset.List{},
			arg:     []id.AssetID{},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with asset for another workspaces",
			seeds: asset.List{
				asset.New().NewID().Project(id.NewProjectID()).NewUUID().
					CreatedByUser(accountdomain.NewUserID()).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild(),
			},
			arg:     []id.AssetID{},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single asset",
			seeds: asset.List{
				a1,
			},
			arg:     []id.AssetID{id1},
			want:    asset.List{a1},
			wantErr: nil,
		},
		{
			name: "1 count with multi assets",
			seeds: asset.List{
				a1,
				asset.New().NewID().Project(id.NewProjectID()).NewUUID().
					CreatedByUser(accountdomain.NewUserID()).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).NewUUID().
					CreatedByUser(accountdomain.NewUserID()).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild(),
			},
			arg:     []id.AssetID{id1},
			want:    asset.List{a1},
			wantErr: nil,
		},
		{
			name: "2 count with multi assets",
			seeds: asset.List{
				a1,
				a2,
				asset.New().NewID().Project(id.NewProjectID()).NewUUID().
					CreatedByUser(accountdomain.NewUserID()).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).NewUUID().
					CreatedByUser(accountdomain.NewUserID()).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild(),
			},
			arg:     []id.AssetID{id1, id2},
			want:    asset.List{a1, a2},
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			for _, a := range tc.seeds {
				err := db.Asset.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}
			assetUC := NewAsset(db, &g, ContainerConfig{})

			got, err := assetUC.FindByIDs(ctx, tc.arg, &usecase.Operator{AcOperator: &accountusecase.Operator{}})
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			// assert always fails on comparing functions
			got.SetAccessInfoResolver(nil)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAsset_Search(t *testing.T) {
	g := gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "", false)),
	}
	pid := id.NewProjectID()
	aid1 := id.NewAssetID()
	uid1 := accountdomain.NewUserID()
	a1 := asset.New().ID(aid1).Project(pid).NewUUID().
		CreatedByUser(uid1).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild()

	aid2 := id.NewAssetID()
	uid2 := accountdomain.NewUserID()
	a2 := asset.New().ID(aid2).Project(pid).NewUUID().
		CreatedByUser(uid2).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild()

	aid3 := id.NewAssetID()
	uid3 := accountdomain.NewUserID()
	a3 := asset.New().ID(aid3).Project(pid).NewUUID().
		CreatedByUser(uid3).Size(1000).Thread(id.NewThreadID().Ref()).FileName("a.txt").MustBuild()

	op := &usecase.Operator{}

	type args struct {
		pid      id.ProjectID
		f        interfaces.AssetFilter
		operator *usecase.Operator
	}
	tests := []struct {
		name    string
		seeds   asset.List
		args    args
		want    asset.List
		wantErr error
	}{
		{
			name:  "0 count in empty db",
			seeds: asset.List{},
			args: args{
				pid:      id.NewProjectID(),
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with asset for another projects",
			seeds: asset.List{
				asset.New().NewID().Project(id.NewProjectID()).NewUUID().
					CreatedByUser(accountdomain.NewUserID()).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild(),
			},
			args: args{
				pid:      id.NewProjectID(),
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single asset",
			seeds: asset.List{
				a1,
			},
			args: args{
				pid: pid,
				f: interfaces.AssetFilter{
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap(),
				},
				operator: op,
			},
			want:    asset.List{a1},
			wantErr: nil,
		},
		{
			name: "1 count with multi assets",
			seeds: asset.List{
				a1,
				asset.New().NewID().Project(id.NewProjectID()).NewUUID().
					CreatedByUser(accountdomain.NewUserID()).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).NewUUID().
					CreatedByUser(accountdomain.NewUserID()).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild(),
			},
			args: args{
				pid: pid,
				f: interfaces.AssetFilter{
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap(),
				},
				operator: op,
			},
			want:    asset.List{a1},
			wantErr: nil,
		},
		{
			name: "2 count with multi assets",
			seeds: asset.List{
				a1,
				a2,
				asset.New().NewID().Project(id.NewProjectID()).NewUUID().
					CreatedByUser(accountdomain.NewUserID()).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).NewUUID().
					CreatedByUser(accountdomain.NewUserID()).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild(),
			},
			args: args{
				pid: pid,
				f: interfaces.AssetFilter{
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(2))}.Wrap(),
				},
				operator: op,
			},
			want:    asset.List{a1, a2},
			wantErr: nil,
		},
		{
			name: "success content type filter",
			seeds: asset.List{
				asset.New().NewID().Project(id.NewProjectID()).NewUUID().
					CreatedByUser(accountdomain.NewUserID()).Size(1000).
					Thread(id.NewThreadID().Ref()).MustBuild(),
			},
			args: args{
				pid: pid,
				f: interfaces.AssetFilter{
					Pagination:   usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap(),
					ContentTypes: []string{"image/jpeg", "image/png"},
				},
				operator: op,
			},
			want:    nil, // empty as asset file data is not set in Asset object
			wantErr: nil,
		},
		{
			name: "success keyword filter",
			seeds: asset.List{
				a3,
			},
			args: args{
				pid: pid,
				f: interfaces.AssetFilter{
					Pagination: usecasex.CursorPagination{First: lo.ToPtr(int64(1))}.Wrap(),
					Keyword:    lo.ToPtr("a"),
				},
				operator: op,
			},
			want:    asset.List{a3}, // empty as asset file data is not set in Asset object
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			for _, a := range tc.seeds {
				err := db.Asset.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}
			assetUC := NewAsset(db, &g, ContainerConfig{})

			got, _, err := assetUC.Search(ctx, tc.args.pid, tc.args.f, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			got.SetAccessInfoResolver(nil)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAsset_Create(t *testing.T) {
	mocktime := time.Now()
	ws := workspace.New().NewID().MustBuild()
	ws2 := workspace.New().NewID().MustBuild()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(ws.ID()).UpdatedAt(mocktime).MustBuild()

	u := user.New().NewID().Name("aaa").Email("aaa@bbb.com").Workspace(ws.ID()).MustBuild()
	acop := &accountusecase.Operator{
		User:               lo.ToPtr(u.ID()),
		WritableWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
	}
	op := &usecase.Operator{
		AcOperator: acop,
	}

	zipMime := "application/zip"
	if runtime.GOOS == "windows" {
		zipMime = "application/x-zip-compressed"
	}

	buf := bytes.NewBufferString("Hello")
	buf2 := bytes.NewBufferString("Hello")
	buf3 := bytes.NewBufferString("Hello")
	buf4 := bytes.NewBufferString("Hello")
	buf5 := bytes.NewBufferString("Hello")
	af := asset.NewFile().Name("aaa.txt").Size(uint64(buf.Len())).Path("aaa.txt").ContentType("text/plain; charset=utf-8").Build()
	af2 := asset.NewFile().Name("aaa.txt").Size(uint64(buf2.Len())).Path("aaa.txt").ContentType("text/plain; charset=utf-8").Build()
	af3 := asset.NewFile().Name("aaa.zip").Size(uint64(buf3.Len())).Path("aaa.zip").ContentType(zipMime).Build()
	af4 := asset.NewFile().Name("aaa.zip").Size(uint64(buf4.Len())).Path("aaa.zip").ContentType(zipMime).Build()
	af5 := asset.NewFile().Name("AAA.ZIP").Size(uint64(buf5.Len())).Path("AAA.ZIP").ContentType(zipMime).Build()

	type args struct {
		cpp      interfaces.CreateAssetParam
		operator *usecase.Operator
	}
	tests := []struct {
		name     string
		seeds    asset.List
		args     args
		want     *asset.Asset
		wantFile *asset.File
		wantErr  error
	}{
		{
			name:  "Create",
			seeds: asset.List{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID: p1.ID(),
					File: &file.File{
						Name:    "aaa.txt",
						Content: io.NopCloser(buf),
						Size:    int64(buf.Len()),
					},
				},
				operator: op,
			},
			want: asset.New().
				NewID().
				Project(p1.ID()).
				CreatedByUser(u.ID()).
				FileName("aaa.txt").
				Size(uint64(buf.Len())).
				Type(asset.PreviewTypeUnknown.Ref()).
				Thread(id.NewThreadID().Ref()).
				NewUUID().
				ArchiveExtractionStatus(lo.ToPtr(asset.ArchiveExtractionStatusDone)).
				MustBuild(),
			wantFile: af,
			wantErr:  nil,
		},
		{
			name:  "Create skip decompress",
			seeds: asset.List{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID: p1.ID(),
					File: &file.File{
						Name:    "aaa.txt",
						Content: io.NopCloser(buf2),
						Size:    int64(buf2.Len()),
					},
					SkipDecompression: true,
				},
				operator: op,
			},
			want: asset.New().
				NewID().
				Project(p1.ID()).
				CreatedByUser(u.ID()).
				FileName("aaa.txt").
				Size(uint64(buf2.Len())).
				Type(asset.PreviewTypeUnknown.Ref()).
				Thread(id.NewThreadID().Ref()).
				NewUUID().
				ArchiveExtractionStatus(lo.ToPtr(asset.ArchiveExtractionStatusDone)).
				MustBuild(),
			wantFile: af2,
			wantErr:  nil,
		},
		{
			name:  "CreateZip",
			seeds: asset.List{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID: p1.ID(),
					File: &file.File{
						Name:    "aaa.zip",
						Content: io.NopCloser(buf3),
						Size:    int64(buf3.Len()),
					},
				},
				operator: op,
			},
			want: asset.New().
				NewID().
				Project(p1.ID()).
				CreatedByUser(u.ID()).
				FileName("aaa.zip").
				Size(uint64(buf3.Len())).
				Type(asset.PreviewTypeUnknown.Ref()).
				Thread(id.NewThreadID().Ref()).
				NewUUID().
				ArchiveExtractionStatus(lo.ToPtr(asset.ArchiveExtractionStatusInProgress)).
				MustBuild(),
			wantFile: af3,
			wantErr:  nil,
		},
		{
			name:  "CreateZip skip decompress",
			seeds: asset.List{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID: p1.ID(),
					File: &file.File{
						Name:    "aaa.zip",
						Content: io.NopCloser(buf4),
						Size:    int64(buf4.Len()),
					},
					SkipDecompression: true,
				},
				operator: op,
			},
			want: asset.New().
				NewID().
				Project(p1.ID()).
				CreatedByUser(u.ID()).
				FileName("aaa.zip").
				Size(uint64(buf4.Len())).
				Type(asset.PreviewTypeUnknown.Ref()).
				Thread(id.NewThreadID().Ref()).
				NewUUID().
				ArchiveExtractionStatus(lo.ToPtr(asset.ArchiveExtractionStatusSkipped)).
				MustBuild(),
			wantFile: af4,
			wantErr:  nil,
		},
		{
			name:  "CreateZipUpper",
			seeds: asset.List{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID: p1.ID(),
					File: &file.File{
						Name:    "AAA.ZIP",
						Content: io.NopCloser(buf5),
						Size:    int64(buf5.Len()),
					},
				},
				operator: op,
			},
			want: asset.New().
				NewID().
				Project(p1.ID()).
				CreatedByUser(u.ID()).
				FileName("AAA.ZIP").
				Size(uint64(buf5.Len())).
				Type(asset.PreviewTypeUnknown.Ref()).
				Thread(id.NewThreadID().Ref()).
				NewUUID().
				ArchiveExtractionStatus(lo.ToPtr(asset.ArchiveExtractionStatusInProgress)).
				MustBuild(),
			wantFile: af5,
			wantErr:  nil,
		},
		{
			name:  "Create invalid file size",
			seeds: asset.List{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID: p1.ID(),
					File: &file.File{
						Name:    "aaa.txt",
						Content: io.NopCloser(buf),
						Size:    10*1024*1024*1024 + 1,
					},
				},
				operator: op,
			},
			want:     nil,
			wantFile: nil,
			wantErr:  gateway.ErrFileTooLarge,
		},
		{
			name:  "Create invalid file",
			seeds: asset.List{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID: p1.ID(),
					File:      nil,
				},
				operator: op,
			},
			want:     nil,
			wantFile: nil,
			wantErr:  interfaces.ErrFileNotIncluded,
		},
		{
			name:  "Create invalid operator",
			seeds: asset.List{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID: p1.ID(),
					File:      nil,
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{},
				},
			},
			want:     nil,
			wantFile: nil,
			wantErr:  interfaces.ErrInvalidOperator,
		},
		{
			name:  "Create project not found",
			seeds: asset.List{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID: project.NewID(),
					File: &file.File{
						Name:    "aaa.txt",
						Content: io.NopCloser(buf),
						Size:    10*1024*1024*1024 + 1,
					},
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User:               lo.ToPtr(u.ID()),
						WritableWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
					},
				},
			},
			want:     nil,
			wantFile: nil,
			wantErr:  rerror.ErrNotFound,
		},
		{
			name:  "Create operator denied",
			seeds: asset.List{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID: p1.ID(),
					File: &file.File{
						Name:    "aaa.txt",
						Content: io.NopCloser(buf),
						Size:    10*1024*1024*1024 + 1,
					},
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User:               lo.ToPtr(u.ID()),
						WritableWorkspaces: []accountdomain.WorkspaceID{ws2.ID()},
					},
				},
			},
			want:     nil,
			wantFile: nil,
			wantErr:  interfaces.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			mfs := afero.NewMemMapFs()
			f, _ := fs.NewFile(mfs, "", false)
			runnerGw := NewMockRunner()

			err := db.User.Save(ctx, u)
			assert.NoError(t, err)

			err2 := db.Workspace.Save(ctx, ws)
			assert.Nil(t, err2)

			err3 := db.Project.Save(ctx, p1.Clone())
			assert.Nil(t, err3)

			for _, a := range tc.seeds {
				err := db.Asset.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}

			assetUC := Asset{
				repos: db,
				gateways: &gateway.Container{
					File:       f,
					TaskRunner: runnerGw,
				},
				ignoreEvent: true,
			}

			got, gotFile, err := assetUC.Create(ctx, tc.args.cpp, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)

			if strings.HasPrefix(got.PreviewType().String(), "image/") {
				assert.Equal(t, asset.PreviewTypeImage.Ref(), got.PreviewType())
			} else {
				assert.Equal(t, asset.PreviewTypeUnknown.Ref(), got.PreviewType())
			}

			assert.Equal(t, tc.want.Project(), got.Project())
			assert.Equal(t, tc.want.PreviewType(), got.PreviewType())
			assert.Equal(t, tc.want.ArchiveExtractionStatus(), got.ArchiveExtractionStatus())

			dbGot, err := db.Asset.FindByID(ctx, got.ID())
			assert.NoError(t, err)
			assert.Equal(t, tc.want.Project(), dbGot.Project())
			assert.Equal(t, tc.want.PreviewType(), dbGot.PreviewType())
			assert.Equal(t, tc.want.ArchiveExtractionStatus(), dbGot.ArchiveExtractionStatus())

			assert.Equal(t, tc.wantFile, gotFile)
		})
	}
}

func TestAsset_Update(t *testing.T) {
	g := gateway.Container{
		File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "", false)),
	}
	uid := accountdomain.NewUserID()
	ws := workspace.New().NewID().MustBuild()
	pid1 := id.NewProjectID()
	p := project.New().ID(pid1).Workspace(ws.ID()).MustBuild()

	var pti = asset.PreviewTypeImage
	var ptg = asset.PreviewTypeGeo

	aid1 := id.NewAssetID()
	thid := id.NewThreadID().Ref()
	a1 := asset.New().ID(aid1).Project(pid1).NewUUID().
		CreatedByUser(uid).Size(1000).Thread(thid).MustBuild()
	a1Updated := asset.New().ID(aid1).Project(pid1).UUID(a1.UUID()).
		CreatedByUser(uid).Size(1000).Thread(thid).Type(&pti).MustBuild()

	pid2 := id.NewProjectID()
	aid2 := id.NewAssetID()
	a2 := asset.New().ID(aid2).Project(pid2).NewUUID().
		CreatedByUser(uid).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild()
	acop := &accountusecase.Operator{
		User:             &uid,
		OwningWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
	}
	op := &usecase.Operator{
		AcOperator:     acop,
		OwningProjects: []id.ProjectID{pid1},
		Integration:    nil,
	}

	type args struct {
		upp      interfaces.UpdateAssetParam
		operator *usecase.Operator
	}
	tests := []struct {
		name    string
		seeds   asset.List
		args    args
		want    *asset.Asset
		wantErr error
	}{
		{
			name:  "invalid operator",
			seeds: asset.List{a1, a2},
			args: args{
				upp: interfaces.UpdateAssetParam{
					AssetID:     aid1,
					PreviewType: &pti,
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{},
				},
			},
			want:    nil,
			wantErr: interfaces.ErrInvalidOperator,
		},
		{
			name:  "operation denied",
			seeds: asset.List{a1, a2},
			args: args{
				upp: interfaces.UpdateAssetParam{
					AssetID:     aid1,
					PreviewType: &pti,
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User:               &uid,
						ReadableWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
					},
				},
			},
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:  "update",
			seeds: asset.List{a1, a2},
			args: args{
				upp: interfaces.UpdateAssetParam{
					AssetID:     aid1,
					PreviewType: &pti,
				},
				operator: op,
			},
			want:    a1Updated,
			wantErr: nil,
		},
		{
			name:  "update not found",
			seeds: asset.List{a1, a2},
			args: args{
				upp: interfaces.UpdateAssetParam{
					AssetID:     idx.ID[id.Asset]{},
					PreviewType: &ptg,
				},
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			// t.Parallel()

			ctx := context.Background()
			db := memory.New()

			err := db.Project.Save(ctx, p)
			assert.NoError(t, err)
			for _, p := range tc.seeds {
				err := db.Asset.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			assetUC := NewAsset(db, &g, ContainerConfig{})

			got, err := assetUC.Update(ctx, tc.args.upp, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			// assert always fails on comparing functions
			got.SetAccessInfoResolver(nil)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAsset_UpdateFiles(t *testing.T) {
	uid := accountdomain.NewUserID()
	assetID1, uuid1 := asset.NewID(), "5130c89f-8f67-4766-b127-49ee6796d464"
	assetID2, uuid2 := asset.NewID(), uuid.New().String()
	ws := workspace.New().NewID().MustBuild()
	proj := project.New().NewID().Workspace(ws.ID()).MustBuild()

	thid := id.NewThreadID().Ref()
	sp := lo.ToPtr(asset.ArchiveExtractionStatusPending)
	a1 := asset.New().
		ID(assetID1).
		Project(proj.ID()).
		CreatedByUser(uid).
		Size(1000).
		UUID(uuid1).
		Thread(thid).
		ArchiveExtractionStatus(sp).
		MustBuild()
	a1f := asset.NewFile().Name("xxx").Path("/xxx.zip").GuessContentType().Build()
	a2 := asset.New().
		ID(assetID2).
		Project(proj.ID()).
		CreatedByUser(uid).
		Size(1000).
		UUID(uuid2).
		Thread(id.NewThreadID().Ref()).
		ArchiveExtractionStatus(sp).
		MustBuild()
	a2f := asset.NewFile().Build()
	acop := &accountusecase.Operator{
		User:             &uid,
		OwningWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
	}
	op := &usecase.Operator{
		AcOperator:     acop,
		OwningProjects: []id.ProjectID{proj.ID()},
	}

	tests := []struct {
		name            string
		operator        *usecase.Operator
		seedAssets      asset.List
		seedFiles       map[asset.ID]*asset.File
		seedProjects    []*project.Project
		prepareFileFunc func() afero.Fs
		assetID         id.AssetID
		status          *asset.ArchiveExtractionStatus
		want            *asset.Asset
		wantFile        *asset.File
		wantErr         error
	}{
		{
			name: "invalid operator",
			operator: &usecase.Operator{
				AcOperator: &accountusecase.Operator{},
			},
			prepareFileFunc: func() afero.Fs {
				return mockFs()
			},
			assetID: assetID1,
			want:    nil,
			wantErr: interfaces.ErrInvalidOperator,
		},
		{
			name:     "not found",
			operator: op,
			prepareFileFunc: func() afero.Fs {
				return mockFs()
			},
			assetID: assetID1,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "operation denied",
			operator: &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					User:               &uid,
					ReadableWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
				},
			},
			seedAssets: asset.List{a1.Clone(), a2.Clone()},
			seedFiles: map[asset.ID]*asset.File{
				a1.ID(): a1f,
				a2.ID(): a2f,
			},
			seedProjects: []*project.Project{proj},
			prepareFileFunc: func() afero.Fs {
				return mockFs()
			},
			assetID: assetID1,
			status:  sp,
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:     "update asset not found",
			operator: op,
			prepareFileFunc: func() afero.Fs {
				return mockFs()
			},
			assetID: assetID1,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:       "update file not found",
			operator:   op,
			seedAssets: asset.List{a1.Clone(), a2.Clone()},
			seedFiles: map[asset.ID]*asset.File{
				a1.ID(): a1f,
				a2.ID(): a2f,
			},
			prepareFileFunc: func() afero.Fs {
				return afero.NewMemMapFs()
			},
			assetID: assetID1,
			status:  lo.ToPtr(asset.ArchiveExtractionStatusFailed),
			want:    nil,
			wantErr: gateway.ErrFileNotFound,
		},
		{
			name:       "update",
			operator:   op,
			seedAssets: asset.List{a1.Clone(), a2.Clone()},
			seedFiles: map[asset.ID]*asset.File{
				a1.ID(): a1f,
				a2.ID(): a2f,
			},
			seedProjects: []*project.Project{proj},
			prepareFileFunc: func() afero.Fs {
				return mockFs()
			},
			assetID: assetID1,
			status:  sp,
			want: asset.New().
				ID(assetID1).
				Project(proj.ID()).
				CreatedByUser(uid).
				Size(1000).
				UUID(uuid1).
				Thread(thid).
				ArchiveExtractionStatus(sp).
				MustBuild(),
			wantFile: asset.NewFile().Name("xxx").Path(path.Join("xxx.zip")).GuessContentType().Children([]*asset.File{
				asset.NewFile().Name("xxx").Path(path.Join("xxx")).Dir().Children([]*asset.File{
					asset.NewFile().Name("yyy").Path(path.Join("xxx", "yyy")).Dir().Children([]*asset.File{
						asset.NewFile().Name("hello.txt").Path(path.Join("xxx", "yyy", "hello.txt")).GuessContentType().Build(),
					}).Build(),
					asset.NewFile().Name("zzz.txt").Path(path.Join("xxx", "zzz.txt")).GuessContentType().Build(),
				}).Build(),
			}).Build(),
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			// t.Parallel()

			ctx := context.Background()
			db := memory.New()

			fileGw := lo.Must(fs.NewFile(tc.prepareFileFunc(), "", false))

			err := db.Project.Save(ctx, proj)
			assert.NoError(t, err)
			for _, p := range tc.seedAssets {
				err := db.Asset.Save(ctx, p.Clone())
				assert.Nil(t, err)
			}
			for id, f := range tc.seedFiles {
				err := db.AssetFile.Save(ctx, id, f.Clone())
				assert.Nil(t, err)
			}
			for _, p := range tc.seedProjects {
				err := db.Project.Save(ctx, p.Clone())
				assert.Nil(t, err)
			}

			assetUC := Asset{
				repos: db,
				gateways: &gateway.Container{
					File: fileGw,
				},
				ignoreEvent: true,
			}
			got, err := assetUC.UpdateFiles(ctx, tc.assetID, tc.status, tc.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			// assert always fails on comparing functions
			got.SetAccessInfoResolver(nil)
			assert.Equal(t, tc.want, got)

			if tc.wantErr != nil {
				gotf, err := db.AssetFile.FindByID(ctx, tc.assetID)
				assert.NoError(t, err)
				assert.Equal(t, tc.wantFile, gotf)
			}
		})
	}
}

func TestAsset_Delete(t *testing.T) {
	uid := accountdomain.NewUserID()

	ws := workspace.New().NewID().MustBuild()
	proj1 := project.New().NewID().Workspace(ws.ID()).MustBuild()
	aid1 := id.NewAssetID()
	a1 := asset.New().ID(aid1).Project(proj1.ID()).NewUUID().
		CreatedByUser(uid).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild()

	proj2 := project.New().NewID().MustBuild()
	aid2 := id.NewAssetID()
	a2 := asset.New().ID(aid2).Project(proj2.ID()).NewUUID().
		CreatedByUser(uid).Size(1000).Thread(id.NewThreadID().Ref()).MustBuild()

	acop := &accountusecase.Operator{
		User:             &uid,
		OwningWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
	}
	op := &usecase.Operator{
		AcOperator:     acop,
		OwningProjects: []id.ProjectID{proj1.ID()},
	}
	type args struct {
		id       id.AssetID
		operator *usecase.Operator
	}
	tests := []struct {
		name         string
		seedsAsset   asset.List
		seedsProject []*project.Project
		args         args
		want         asset.List
		mockAssetErr bool
		wantErr      error
	}{
		{
			name:         "delete",
			seedsAsset:   asset.List{a1, a2},
			seedsProject: []*project.Project{proj1, proj2},
			args: args{
				id:       aid1,
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:       "invalid operator",
			seedsAsset: asset.List{a1, a2},
			args: args{
				id: id.NewAssetID(),
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{},
				},
			},
			want:    nil,
			wantErr: interfaces.ErrInvalidOperator,
		},
		{
			name:         "operation denied",
			seedsAsset:   asset.List{a1, a2},
			seedsProject: []*project.Project{proj1, proj2},
			args: args{
				id: aid1,
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User:               &uid,
						ReadableWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
					},
				},
			},
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:       "delete not found",
			seedsAsset: asset.List{a1, a2},
			args: args{
				id:       id.NewAssetID(),
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:       "delete od",
			seedsAsset: asset.List{},
			args: args{
				id:       aid2,
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			for _, p := range tc.seedsAsset {
				err := db.Asset.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			for _, p := range tc.seedsProject {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			assetUC := Asset{
				repos:       db,
				gateways:    &gateway.Container{},
				ignoreEvent: true,
			}
			id, err := assetUC.Delete(ctx, tc.args.id, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.Equal(t, tc.args.id, id)
			assert.NoError(t, err)

			_, err = db.Asset.FindByID(ctx, tc.args.id)
			assert.Equal(t, rerror.ErrNotFound, err)
		})
	}
}

func mockFs() afero.Fs {
	files := map[string]string{
		path.Join("assets", "51", "30c89f-8f67-4766-b127-49ee6796d464", "xxx.zip"):                 "xxx",
		path.Join("assets", "51", "30c89f-8f67-4766-b127-49ee6796d464", "xxx", "zzz.txt"):          "zzz",
		path.Join("assets", "51", "30c89f-8f67-4766-b127-49ee6796d464", "xxx", "yyy", "hello.txt"): "hello",
		path.Join("plugins", "aaa~1.0.0", "foo.js"):                                                "bar",
		path.Join("published", "s.json"):                                                           "{}",
	}

	fs := afero.NewMemMapFs()
	for name, content := range files {
		f, _ := fs.Create(name)
		_, _ = f.WriteString(content)
		_ = f.Close()
	}
	return fs
}

// mockRunner implements gateway.TaskRunner
type mockRunner struct{}

func NewMockRunner() gateway.TaskRunner {
	return &mockRunner{}
}

func (r *mockRunner) Run(context.Context, task.Payload) error {
	return nil
}

func (r *mockRunner) Retry(context.Context, string) error {
	return nil
}

func Test_detectPreviewType(t *testing.T) {
	tests := []struct {
		name  string
		files []gateway.FileEntry
		want  *asset.PreviewType
	}{
		{
			name: "MVT",
			files: []gateway.FileEntry{
				{
					Name: "test/0/123.mvt",
					Size: 123,
				},
			},
			want: lo.ToPtr(asset.PreviewTypeGeoMvt),
		},
		{
			name: "3d tiles",
			files: []gateway.FileEntry{
				{
					Name: "test/tileset.json",
					Size: 123,
				},
			},
			want: lo.ToPtr(asset.PreviewTypeGeo3dTiles),
		},
		{
			name: "Unknown",
			files: []gateway.FileEntry{
				{
					Name: "test.jpg",
					Size: 123,
				},
			},
			want: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, detectPreviewType(tt.files))
		})
	}
}

func TestAsset_generateJSONContentWithPagination(t *testing.T) {
	// Create test schema
	schemaID := id.NewSchemaID()
	projectID := id.NewProjectID()

	// Create test model
	modelID := id.NewModelID()
	modelKey := id.NewKey("test_model")
	testModel := model.New().
		ID(modelID).
		Project(projectID).
		Schema(schemaID).
		Key(modelKey).
		Name("Test Model").
		Description("Test model description").
		MustBuild()

	// Create test items
	itemID1 := id.NewItemID()
	itemID2 := id.NewItemID()
	testItems := item.List{
		item.New().
			ID(itemID1).
			Model(modelID).
			Schema(schemaID).
			Project(projectID).
			Fields([]*item.Field{}).
			MustBuild(),
		item.New().
			ID(itemID2).
			Model(modelID).
			Schema(schemaID).
			Project(projectID).
			Fields([]*item.Field{}).
			MustBuild(),
	}

	tests := []struct {
		name     string
		model    *model.Model
		items    item.List
		pageInfo *usecasex.PageInfo
		want     map[string]any
		wantErr  bool
	}{
		{
			name:     "Basic JSON generation without pagination",
			model:    testModel,
			items:    testItems,
			pageInfo: nil,
			want: map[string]any{
				"model": map[string]any{
					"id":          modelID.String(),
					"name":        "Test Model",
					"description": "Test model description",
					"key":         modelKey.String(),
				},
				"items": testItems,
			},
			wantErr: false,
		},
		{
			name:  "JSON generation with pagination info",
			model: testModel,
			items: testItems,
			pageInfo: &usecasex.PageInfo{
				TotalCount:      100,
				HasNextPage:     true,
				HasPreviousPage: false,
				StartCursor:     lo.ToPtr(usecasex.Cursor("start123")),
				EndCursor:       lo.ToPtr(usecasex.Cursor("end456")),
			},
			want: map[string]any{
				"model": map[string]any{
					"id":          modelID.String(),
					"name":        "Test Model",
					"description": "Test model description",
					"key":         modelKey.String(),
				},
				"items": testItems,
				"pagination": map[string]any{
					"totalCount":  int64(100),
					"hasNextPage": true,
					"hasPrevPage": false,
					"startCursor": lo.ToPtr(usecasex.Cursor("start123")),
					"endCursor":   lo.ToPtr(usecasex.Cursor("end456")),
				},
			},
			wantErr: false,
		},
		{
			name:  "Empty items with pagination",
			model: testModel,
			items: item.List{},
			pageInfo: &usecasex.PageInfo{
				TotalCount:      0,
				HasNextPage:     false,
				HasPreviousPage: false,
				StartCursor:     nil,
				EndCursor:       nil,
			},
			want: map[string]any{
				"model": map[string]any{
					"id":          modelID.String(),
					"name":        "Test Model",
					"description": "Test model description",
					"key":         modelKey.String(),
				},
				"items": item.List{},
				"pagination": map[string]any{
					"totalCount":  int64(0),
					"hasNextPage": false,
					"hasPrevPage": false,
					"startCursor": (*usecasex.Cursor)(nil),
					"endCursor":   (*usecasex.Cursor)(nil),
				},
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			t.Parallel()
			// Create Asset instance
			a := &Asset{}

			// Call the function
			result, err := a.generateJSONContentWithPagination(tt.model, tt.items, nil, tt.pageInfo)

			// Check error
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)

			// Parse the result JSON
			var resultData map[string]any
			err = json.Unmarshal(result, &resultData)
			assert.NoError(t, err)

			// Verify model data
			modelData, ok := resultData["model"].(map[string]any)
			assert.True(t, ok)
			expectedModel := tt.want["model"].(map[string]any)
			assert.Equal(t, expectedModel["id"], modelData["id"])
			assert.Equal(t, expectedModel["name"], modelData["name"])
			assert.Equal(t, expectedModel["description"], modelData["description"])
			assert.Equal(t, expectedModel["key"], modelData["key"])

			// Verify items exist (we can't easily compare the complex item structures)
			itemsData, ok := resultData["items"]
			assert.True(t, ok)
			assert.NotNil(t, itemsData)

			// Verify pagination if expected
			if tt.pageInfo != nil {
				paginationData, ok := resultData["pagination"].(map[string]any)
				assert.True(t, ok)
				expectedPagination := tt.want["pagination"].(map[string]any)
				assert.Equal(t, expectedPagination["totalCount"], int64(paginationData["totalCount"].(float64)))
				assert.Equal(t, expectedPagination["hasNextPage"], paginationData["hasNextPage"])
				assert.Equal(t, expectedPagination["hasPrevPage"], paginationData["hasPrevPage"])
			} else {
				_, exists := resultData["pagination"]
				assert.False(t, exists)
			}

			// Verify JSON is properly formatted (indented)
			assert.Contains(t, string(result), "  ") // Should contain indentation
		})
	}
}

func TestAsset_generateGeoJSONContent(t *testing.T) {
	// Create workspace and project (following TestItem_ItemsAsCSV pattern)
	r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
	w := accountdomain.NewWorkspaceID()
	prj := project.New().NewID().Workspace(w).RequestRoles(r).MustBuild()

	// Create geometry supported types
	gst := schema.GeometryObjectSupportedTypeList{
		schema.GeometryObjectSupportedTypePoint,
		schema.GeometryObjectSupportedTypeLineString,
	}

	// Create schema with geometry and non-geometry fields (following TestItem_ItemsAsCSV pattern)
	schemaID := id.NewSchemaID()

	// Create geometry field
	geometryFieldID := id.NewFieldID()
	geometryField := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).
		ID(geometryFieldID).
		Name("Location").
		Key(id.RandomKey()).
		MustBuild()

	// Create text field
	textFieldID := id.NewFieldID()
	textField := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).
		ID(textFieldID).
		Name("Description").
		Key(id.RandomKey()).
		MustBuild()

	// Create integer field
	intFieldID := id.NewFieldID()
	newInt, _ := schema.NewInteger(lo.ToPtr(int64(0)), lo.ToPtr(int64(1000)))
	intField := schema.NewField(newInt.TypeProperty()).
		ID(intFieldID).
		Name("Count").
		Key(id.RandomKey()).
		MustBuild()

	// Create schema with all fields
	testSchema := schema.New().
		ID(schemaID).
		Workspace(w).
		Project(prj.ID()).
		Fields(schema.FieldList{geometryField, textField, intField}).
		MustBuild()

	// Create model
	testModel := model.New().NewID().Schema(testSchema.ID()).Key(id.RandomKey()).Project(testSchema.Project()).MustBuild()

	// Create test items with geometry and field values
	itemID1 := id.NewItemID()
	itemID2 := id.NewItemID()

	// Point geometry JSON strings (following TestItem_ItemsAsCSV format)
	pointGeometry1 := `{"coordinates":[139.6503,35.6762],"type":"Point"}`
	pointGeometry2 := `{"coordinates":[140.1234,36.5678],"type":"Point"}`

	testItems := item.List{
		item.New().
			ID(itemID1).
			Model(testModel.ID()).
			Schema(schemaID).
			Project(testSchema.Project()).
			Thread(id.NewThreadID().Ref()).
			Fields([]*item.Field{
				item.NewField(geometryFieldID, value.TypeGeometryObject.Value(pointGeometry1).AsMultiple(), nil),
				item.NewField(textFieldID, value.TypeText.Value("Tokyo Station").AsMultiple(), nil),
				item.NewField(intFieldID, value.TypeInteger.Value(int64(42)).AsMultiple(), nil),
			}).
			MustBuild(),
		item.New().
			ID(itemID2).
			Model(testModel.ID()).
			Schema(schemaID).
			Project(testSchema.Project()).
			Thread(id.NewThreadID().Ref()).
			Fields([]*item.Field{
				item.NewField(geometryFieldID, value.TypeGeometryObject.Value(pointGeometry2).AsMultiple(), nil),
				item.NewField(textFieldID, value.TypeText.Value("Another Place").AsMultiple(), nil),
				item.NewField(intFieldID, value.TypeInteger.Value(int64(99)).AsMultiple(), nil),
			}).
			MustBuild(),
	}

	tests := []struct {
		name     string
		schema   *schema.Schema
		items    item.List
		wantErr  bool
		validate func(t *testing.T, result []byte)
	}{
		{
			name:    "Generate GeoJSON with Point geometries and properties",
			schema:  testSchema,
			items:   testItems,
			wantErr: false,
			validate: func(t *testing.T, result []byte) {
				var geoJSON map[string]any
				err := json.Unmarshal(result, &geoJSON)
				assert.NoError(t, err)

				// Verify FeatureCollection structure
				assert.Equal(t, "FeatureCollection", geoJSON["type"])

				features, ok := geoJSON["features"].([]any)
				assert.True(t, ok)
				assert.Len(t, features, 2)

				// Verify first feature
				feature1 := features[0].(map[string]any)
				assert.Equal(t, "Feature", feature1["type"])
				assert.Equal(t, itemID1.String(), feature1["id"])

				// Verify geometry
				geometry1 := feature1["geometry"].(map[string]any)
				assert.Equal(t, "Point", geometry1["type"])
				coords1 := geometry1["coordinates"].([]any)
				assert.Equal(t, 139.6503, coords1[0])
				assert.Equal(t, 35.6762, coords1[1])

				// Verify properties
				properties1 := feature1["properties"].(map[string]any)
				assert.Equal(t, "Tokyo Station", properties1["Description"])
				assert.Equal(t, float64(42), properties1["Count"]) // JSON unmarshals numbers as float64

				// Verify second feature
				feature2 := features[1].(map[string]any)
				assert.Equal(t, "Feature", feature2["type"])
				assert.Equal(t, itemID2.String(), feature2["id"])

				geometry2 := feature2["geometry"].(map[string]any)
				assert.Equal(t, "Point", geometry2["type"])
				coords2 := geometry2["coordinates"].([]any)
				assert.Equal(t, 140.1234, coords2[0])
				assert.Equal(t, 36.5678, coords2[1])

				properties2 := feature2["properties"].(map[string]any)
				assert.Equal(t, "Another Place", properties2["Description"])
				assert.Equal(t, float64(99), properties2["Count"])
			},
		},
		{
			name:    "Error when schema has no geometry fields",
			schema:  schema.New().ID(schemaID).Workspace(w).Project(prj.ID()).Fields([]*schema.Field{textField}).MustBuild(),
			items:   item.List{},
			wantErr: true,
			validate: func(t *testing.T, result []byte) {
				// Should not reach here if error is expected
			},
		},
		{
			name:    "Empty items with valid geometry schema",
			schema:  testSchema,
			items:   item.List{},
			wantErr: false,
			validate: func(t *testing.T, result []byte) {
				var geoJSON map[string]any
				err := json.Unmarshal(result, &geoJSON)
				assert.NoError(t, err)

				assert.Equal(t, "FeatureCollection", geoJSON["type"])
				features := geoJSON["features"].([]any)
				assert.Len(t, features, 0)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Create Asset instance
			a := &Asset{}

			// Call the function
			result, err := a.generateGeoJSONContent(tt.schema, tt.items)

			// Check error expectation
			if tt.wantErr {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)
			assert.NotEmpty(t, result)

			// Run custom validation
			tt.validate(t, result)

			// Verify JSON is properly formatted (indented)
			assert.Contains(t, string(result), "  ")
		})
	}
}

func TestAsset_generateCSVContent(t *testing.T) {
	// Create workspace and project (following TestItem_ItemsAsCSV pattern)
	r := []workspace.Role{workspace.RoleReader, workspace.RoleWriter}
	w := accountdomain.NewWorkspaceID()
	prj := project.New().NewID().Workspace(w).RequestRoles(r).MustBuild()

	// Create geometry supported types
	gst := schema.GeometryObjectSupportedTypeList{
		schema.GeometryObjectSupportedTypePoint,
		schema.GeometryObjectSupportedTypeLineString,
	}

	// Create schema with geometry and non-geometry fields (following TestItem_ItemsAsCSV pattern)
	schemaID := id.NewSchemaID()

	// Create geometry field
	geometryFieldID := id.NewFieldID()
	geometryField := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).
		ID(geometryFieldID).
		Name("Location").
		Key(id.RandomKey()).
		MustBuild()

	// Create text field
	textFieldID := id.NewFieldID()
	textField := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).
		ID(textFieldID).
		Name("Description").
		Key(id.RandomKey()).
		MustBuild()

	// Create integer field
	intFieldID := id.NewFieldID()
	newInt, _ := schema.NewInteger(lo.ToPtr(int64(0)), lo.ToPtr(int64(1000)))
	intField := schema.NewField(newInt.TypeProperty()).
		ID(intFieldID).
		Name("Count").
		Key(id.RandomKey()).
		MustBuild()

	// Create schema with all fields
	testSchema := schema.New().
		ID(schemaID).
		Workspace(w).
		Project(prj.ID()).
		Fields([]*schema.Field{geometryField, textField, intField}).
		MustBuild()

	// Create model
	testModel := model.New().
		NewID().
		Schema(testSchema.ID()).
		Key(id.RandomKey()).
		Project(testSchema.Project()).
		MustBuild()

	// Create test items with field values (following TestItem_ItemsAsCSV pattern)
	itemID1 := id.NewItemID()
	itemID2 := id.NewItemID()

	// Create field values for item 1 (using correct syntax)
	fi1_geo := item.NewField(geometryFieldID, value.TypeGeometryObject.Value(`{"type":"Point","coordinates":[139.6503,35.6762]}`).AsMultiple(), nil)
	fi1_text := item.NewField(textFieldID, value.TypeText.Value("Tokyo Station").AsMultiple(), nil)
	fi1_int := item.NewField(intFieldID, value.TypeInteger.Value(42).AsMultiple(), nil)
	item1Fields := []*item.Field{fi1_geo, fi1_text, fi1_int}

	// Create field values for item 2 (using correct syntax)
	fi2_geo := item.NewField(geometryFieldID, value.TypeGeometryObject.Value(`{"type":"Point","coordinates":[140.1234,36.5678]}`).AsMultiple(), nil)
	fi2_text := item.NewField(textFieldID, value.TypeText.Value("Another Place").AsMultiple(), nil)
	fi2_int := item.NewField(intFieldID, value.TypeInteger.Value(99).AsMultiple(), nil)
	item2Fields := []*item.Field{fi2_geo, fi2_text, fi2_int}

	testItems := item.List{
		item.New().
			ID(itemID1).
			Model(testModel.ID()).
			Schema(testSchema.ID()).
			Project(testSchema.Project()).
			Thread(id.NewThreadID().Ref()).
			Fields(item1Fields).
			MustBuild(),
		item.New().
			ID(itemID2).
			Model(testModel.ID()).
			Schema(testSchema.ID()).
			Project(testSchema.Project()).
			Thread(id.NewThreadID().Ref()).
			Fields(item2Fields).
			MustBuild(),
	}

	tests := []struct {
		name     string
		schema   *schema.Schema
		items    item.List
		wantErr  bool
		validate func(t *testing.T, result []byte)
	}{
		{
			name:    "Generate CSV with Point geometries and properties",
			schema:  testSchema,
			items:   testItems,
			wantErr: false,
			validate: func(t *testing.T, result []byte) {
				csvContent := string(result)
				lines := strings.Split(csvContent, "\n")

				// Remove empty lines
				var nonEmptyLines []string
				for _, line := range lines {
					if strings.TrimSpace(line) != "" {
						nonEmptyLines = append(nonEmptyLines, line)
					}
				}

				// Should have header + 2 data rows
				assert.GreaterOrEqual(t, len(nonEmptyLines), 3)

				// Check header contains expected columns
				header := nonEmptyLines[0]
				assert.Contains(t, header, "location_lat")
				assert.Contains(t, header, "location_lng")
				assert.Contains(t, header, "Description")
				assert.Contains(t, header, "Count")

				// Check first data row
				row1 := nonEmptyLines[1]
				assert.Contains(t, row1, "35.6762")  // latitude
				assert.Contains(t, row1, "139.6503") // longitude
				assert.Contains(t, row1, "Tokyo Station")
				assert.Contains(t, row1, "42")

				// Check second data row
				row2 := nonEmptyLines[2]
				assert.Contains(t, row2, "36.5678")  // latitude
				assert.Contains(t, row2, "140.1234") // longitude
				assert.Contains(t, row2, "Another Place")
				assert.Contains(t, row2, "99")
			},
		},
		{
			name:    "Generate CSV without Point geometry fields",
			schema:  schema.New().ID(schemaID).Workspace(w).Project(prj.ID()).Fields([]*schema.Field{textField, intField}).MustBuild(),
			items:   item.List{},
			wantErr: false,
			validate: func(t *testing.T, result []byte) {
				csvContent := string(result)
				lines := strings.Split(csvContent, "\n")

				// Remove empty lines
				var nonEmptyLines []string
				for _, line := range lines {
					if strings.TrimSpace(line) != "" {
						nonEmptyLines = append(nonEmptyLines, line)
					}
				}

				// Should have only header row
				assert.Equal(t, 1, len(nonEmptyLines))

				// Check header contains expected non-geometry columns only
				header := nonEmptyLines[0]
				assert.NotContains(t, header, "location_lat")
				assert.NotContains(t, header, "location_lng")
				assert.Contains(t, header, "Description")
				assert.Contains(t, header, "Count")
			},
		},
		{
			name:    "Empty items with valid Point geometry schema",
			schema:  testSchema,
			items:   item.List{},
			wantErr: false,
			validate: func(t *testing.T, result []byte) {
				csvContent := string(result)
				lines := strings.Split(csvContent, "\n")

				// Remove empty lines
				var nonEmptyLines []string
				for _, line := range lines {
					if strings.TrimSpace(line) != "" {
						nonEmptyLines = append(nonEmptyLines, line)
					}
				}

				// Should have only header row
				assert.Equal(t, 1, len(nonEmptyLines))

				// Check header contains expected columns
				header := nonEmptyLines[0]
				assert.Contains(t, header, "location_lat")
				assert.Contains(t, header, "location_lng")
				assert.Contains(t, header, "Description")
				assert.Contains(t, header, "Count")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Create Asset instance
			a := &Asset{}

			// Call the function
			result, err := a.generateCSVContent(tt.schema, tt.items)

			// Check error expectation
			if tt.wantErr {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)
			assert.NotEmpty(t, result)

			// Run custom validation
			tt.validate(t, result)
		})
	}
}

func TestAsset_fetchItemsInBatches(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()

	// Create test schema with fields
	textFieldID := id.NewFieldID()
	numberFieldID := id.NewFieldID()
	boolFieldID := id.NewFieldID()
	geoFieldID := id.NewFieldID()
	numField, _ := schema.NewInteger(lo.ToPtr(int64(0)), lo.ToPtr(int64(999999)))
	textField := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().ID(textFieldID).Key(id.RandomKey()).Name("title").MustBuild()
	numberField := schema.NewField(numField.TypeProperty()).NewID().ID(numberFieldID).Key(id.RandomKey()).Name("rating").MustBuild()
	boolField := schema.NewField(schema.NewBool().TypeProperty()).NewID().ID(boolFieldID).Key(id.RandomKey()).Name("active").MustBuild()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint}
	geoField := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().ID(geoFieldID).Key(id.RandomKey()).Name("location").MustBuild()

	testSchema := schema.New().NewID().Workspace(wid).Project(pid).Fields(schema.FieldList{textField, numberField, boolField, geoField}).MustBuild()

	// Create different model IDs for each test case
	touristModelID := id.NewModelID()
	urbanModelID := id.NewModelID()
	configModelID := id.NewModelID()

	// Note: We'll create separate instances for each test to avoid data races

	// Mock time for consistent timestamps
	restore := util.MockNow(time.Now().Truncate(time.Millisecond).UTC())
	createTestItem := func(itemID id.ItemID, modelID id.ModelID, title string, number int64, isActive bool, geoData string) *item.Item {
		fields := []*item.Field{
			item.NewField(textFieldID, value.TypeText.Value(title).AsMultiple(), nil),
			item.NewField(numberFieldID, value.TypeInteger.Value(number).AsMultiple(), nil),
			item.NewField(boolFieldID, value.TypeBool.Value(isActive).AsMultiple(), nil),
		}

		// Add geometry field if provided
		if geoData != "" {
			fields = append(fields, item.NewField(geoFieldID, value.TypeGeometryObject.Value(geoData).AsMultiple(), nil))
		}

		return item.New().
			ID(itemID).
			Schema(testSchema.ID()).
			Model(modelID).
			Project(pid).
			Thread(id.NewThreadID().Ref()).
			Fields(fields).
			MustBuild()
	}

	// Create diverse test datasets for each model
	touristItems := item.List{
		createTestItem(id.NewItemID(), touristModelID, "Tokyo Tower", 4, true, `{"type":"Point","coordinates":[139.7454,35.6586]}`),
		createTestItem(id.NewItemID(), touristModelID, "Mount Fuji", 5, true, `{"type":"Point","coordinates":[138.7274,35.3606]}`),
		createTestItem(id.NewItemID(), touristModelID, "Kyoto Temple", 5, true, `{"type":"Point","coordinates":[135.7681,35.0116]}`),
	}

	urbanItems := item.List{
		createTestItem(id.NewItemID(), urbanModelID, "Central Station", 3, true, `{"type":"Point","coordinates":[139.7677,35.6811]}`),
		createTestItem(id.NewItemID(), urbanModelID, "City Hospital", 4, true, `{"type":"Point","coordinates":[139.6503,35.6762]}`),
		createTestItem(id.NewItemID(), urbanModelID, "Shopping Mall", 4, false, `{"type":"Point","coordinates":[139.7024,35.6598]}`),
		createTestItem(id.NewItemID(), urbanModelID, "Public Library", 3, true, `{"type":"Point","coordinates":[139.6917,35.6895]}`),
		createTestItem(id.NewItemID(), urbanModelID, "Fire Station", 5, true, `{"type":"Point","coordinates":[139.7413,35.6582]}`),
	}

	configItems := item.List{
		createTestItem(id.NewItemID(), configModelID, "System Config", 1, true, `{"type":"Point","coordinates":[0,0]}`),
		createTestItem(id.NewItemID(), configModelID, "User Preferences", 2, false, `{"type":"Point","coordinates":[1,1]}`),
	}
	restore()

	type args struct {
		modelID    id.ModelID
		pagination *usecasex.Pagination
	}

	tests := []struct {
		name        string
		seedItems   item.List
		seedSchema  *schema.Schema
		modelID     id.ModelID
		args        args
		want        int
		wantErr     error
		mockItemErr bool
	}{
		{
			name:       "Tourist attractions - direct fetch",
			seedItems:  touristItems,
			seedSchema: testSchema,
			modelID:    touristModelID,
			args: args{
				modelID: touristModelID,
				pagination: &usecasex.Pagination{
					Cursor: &usecasex.CursorPagination{
						First: lo.ToPtr(int64(10)),
					},
				},
			},
			want:    3,
			wantErr: nil,
		},
		{
			name:       "Urban facilities - limited fetch",
			seedItems:  urbanItems,
			seedSchema: testSchema,
			modelID:    urbanModelID,
			args: args{
				modelID: urbanModelID,
				pagination: &usecasex.Pagination{
					Cursor: &usecasex.CursorPagination{
						First: lo.ToPtr(int64(10)),
					},
				},
			},
			want:    5,
			wantErr: nil,
		},
		{
			name:       "Configuration items - fallback batch size",
			seedItems:  configItems,
			seedSchema: testSchema,
			modelID:    configModelID,
			args: args{
				modelID: configModelID,
				pagination: &usecasex.Pagination{
					Cursor: &usecasex.CursorPagination{
						First: lo.ToPtr(int64(5)),
					},
				},
			},
			want:    2,
			wantErr: nil,
		},
		{
			name:       "Empty dataset",
			seedItems:  item.List{},
			seedSchema: testSchema,
			modelID:    touristModelID,
			args: args{
				modelID:    touristModelID,
				pagination: nil, // Test with no pagination
			},
			want:    0,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {

			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			if tc.mockItemErr {
				memory.SetItemError(db.Item, tc.wantErr)
			}

			// Create fresh instances for this test to avoid data races
			testProject := project.New().ID(pid).Workspace(wid).MustBuild()
			testModel := model.New().ID(tc.modelID).Schema(testSchema.ID()).Key(id.RandomKey()).Project(pid).MustBuild()

			// Seed project and model
			err := db.Project.Save(ctx, testProject)
			assert.NoError(t, err)
			err = db.Model.Save(ctx, testModel)
			assert.NoError(t, err)
			for _, seed := range tc.seedItems {
				err := db.Item.Save(ctx, seed)
				assert.NoError(t, err)
				// Publish the item by adding Public ref to Latest version
				err = db.Item.UpdateRef(ctx, seed.ID(), version.Public, version.Latest.OrVersion().Ref())
				assert.NoError(t, err)
			}
			if tc.seedSchema != nil {
				err := db.Schema.Save(ctx, tc.seedSchema)
				assert.NoError(t, err)
			}

			// Create asset use case
			assetUC := NewAsset(db, &gateway.Container{}, ContainerConfig{})
			assetConcrete := assetUC.(*Asset)
			assetConcrete.ignoreEvent = true

			// Call fetchItemsInBatches
			result, pageInfo, err := assetConcrete.fetchItemsInBatches(ctx, tc.args.modelID, tc.args.pagination)

			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, len(result))
			// pageInfo may be nil or populated depending on pagination settings
			_ = pageInfo
		})
	}
}

func TestAsset_fetchItemsInBatches_ErrorHandling(t *testing.T) {
	ctx := context.Background()
	projectID := id.NewProjectID()
	modelID := id.NewModelID()

	tests := []struct {
		name          string
		setupDB       func(*repo.Container)
		batchSize     int
		pagination    *usecasex.Pagination
		expectError   bool
		errorContains string
	}{
		{
			name:      "Invalid model ID handling",
			batchSize: 1000, // Large batch size to ensure direct fetch
			setupDB: func(db *repo.Container) {
				w := accountdomain.NewWorkspaceID()
				prj := project.New().ID(projectID).Workspace(w).MustBuild()
				_ = db.Project.Save(context.Background(), prj)
			},
			pagination: &usecasex.Pagination{
				Cursor: &usecasex.CursorPagination{
					First: lo.ToPtr(int64(5)),
				},
			},
			expectError:   false, // Should handle gracefully and return empty result
			errorContains: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			// Setup memory database
			db := memory.New()

			// Apply test-specific setup
			if tt.setupDB != nil {
				tt.setupDB(db)
			}

			// Create asset interactor
			asset := NewAsset(db, &gateway.Container{}, ContainerConfig{
				ExportModelToAssetBatchSize: tt.batchSize,
			})

			// Cast to concrete type to access private method
			assetConcrete := asset.(*Asset)

			// Call the method under test
			result, pageInfo, err := assetConcrete.fetchItemsInBatches(ctx, modelID, tt.pagination)

			if tt.expectError {
				assert.Error(t, err)
				if tt.errorContains != "" {
					assert.Contains(t, err.Error(), tt.errorContains)
				}
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				// Result may be nil or empty when no items are found, which is acceptable
				if result != nil {
					assert.IsType(t, item.VersionedList{}, result)
				}
				_ = pageInfo
			}
		})
	}
}

func TestAsset_ExportModelToAssets(t *testing.T) {
	uid := accountdomain.NewUserID()
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()

	// Create test schema with fields
	textFieldID := id.NewFieldID()
	numberFieldID := id.NewFieldID()
	boolFieldID := id.NewFieldID()
	geoFieldID := id.NewFieldID()

	textField := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().ID(textFieldID).Key(id.RandomKey()).Name("title").MustBuild()
	numField, _ := schema.NewInteger(lo.ToPtr(int64(0)), lo.ToPtr(int64(999999)))
	numberField := schema.NewField(numField.TypeProperty()).NewID().ID(numberFieldID).Key(id.RandomKey()).Name("rating").MustBuild()
	boolField := schema.NewField(schema.NewBool().TypeProperty()).NewID().ID(boolFieldID).Key(id.RandomKey()).Name("active").MustBuild()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint}
	geoField := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().ID(geoFieldID).Key(id.RandomKey()).Name("location").MustBuild()

	testSchema := schema.New().NewID().Workspace(wid).Project(pid).Fields(schema.FieldList{textField, numberField, boolField, geoField}).MustBuild()

	// Create different model IDs for each test case
	jsonModelID := id.NewModelID()
	geoJSONModelID := id.NewModelID()
	csvModelID := id.NewModelID()

	// Note: We'll create separate instances for each test to avoid data races

	// Mock time for consistent timestamps
	restore := util.MockNow(time.Now().Truncate(time.Millisecond).UTC())
	createTestItem := func(itemID id.ItemID, modelID id.ModelID, title string, number int64, isActive bool, geoData string) *item.Item {
		fields := []*item.Field{
			item.NewField(textFieldID, value.TypeText.Value(title).AsMultiple(), nil),
			item.NewField(numberFieldID, value.TypeInteger.Value(number).AsMultiple(), nil),
			item.NewField(boolFieldID, value.TypeBool.Value(isActive).AsMultiple(), nil),
		}

		// Add geometry field if provided
		if geoData != "" {
			fields = append(fields, item.NewField(geoFieldID, value.TypeGeometryObject.Value(geoData).AsMultiple(), nil))
		}

		return item.New().
			ID(itemID).
			Schema(testSchema.ID()).
			Model(modelID).
			Project(pid).
			Thread(id.NewThreadID().Ref()).
			Fields(fields).
			MustBuild()
	}

	jsonItems := item.List{
		createTestItem(id.NewItemID(), jsonModelID, "JSON Export Item 1", 100, true, `{"type":"Point","coordinates":[139.7454,35.6586]}`),
		createTestItem(id.NewItemID(), jsonModelID, "JSON Export Item 2", 200, false, `{"type":"Point","coordinates":[138.7274,35.3606]}`),
	}

	geoJSONItems := item.List{
		createTestItem(id.NewItemID(), geoJSONModelID, "GeoJSON Location 1", 85, true, `{"type":"Point","coordinates":[139.6917,35.6895]}`),
		createTestItem(id.NewItemID(), geoJSONModelID, "GeoJSON Location 2", 90, true, `{"type":"Point","coordinates":[135.5023,34.6937]}`),
		createTestItem(id.NewItemID(), geoJSONModelID, "GeoJSON Location 3", 75, false, `{"type":"Point","coordinates":[132.4596,34.3853]}`),
	}

	csvItems := item.List{
		createTestItem(id.NewItemID(), csvModelID, "CSV Data Row 1", 50, true, `{"type":"Point","coordinates":[140.1234,36.5678]}`),
		createTestItem(id.NewItemID(), csvModelID, "CSV Data Row 2", 75, false, `{"type":"Point","coordinates":[140.2345,36.6789]}`),
	}
	restore()

	type args struct {
		param    interfaces.ExportModelToAssetsParam
		operator *usecase.Operator
	}

	tests := []struct {
		name        string
		seedItems   item.List
		seedSchema  *schema.Schema
		modelID     id.ModelID
		args        args
		want        func(*testing.T, *asset.Asset) // Validation function
		wantErr     error
		wantErrMsg  string // For dynamic errors, check message instead
		mockItemErr bool
	}{
		{
			name:       "Export to JSON successfully",
			seedItems:  jsonItems,
			seedSchema: testSchema,
			modelID:    jsonModelID,
			args: args{
				param: interfaces.ExportModelToAssetsParam{
					ProjectID: pid,
					Format:    interfaces.ExportFormatJSON,
					Pagination: &usecasex.Pagination{
						Cursor: &usecasex.CursorPagination{
							First: lo.ToPtr(int64(10)),
						},
					},
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User:             &uid,
						OwningWorkspaces: []accountdomain.WorkspaceID{wid},
					},
				},
			},
			want: func(t *testing.T, result *asset.Asset) {
				assert.NotNil(t, result)
				assert.Equal(t, pid, result.Project())
				assert.Contains(t, result.FileName(), ".json")
				assert.True(t, result.Size() > 0)
			},
			wantErr: nil,
		},
		{
			name:       "Export to GeoJSON successfully",
			seedItems:  geoJSONItems,
			seedSchema: testSchema,
			modelID:    geoJSONModelID,
			args: args{
				param: interfaces.ExportModelToAssetsParam{
					ProjectID:  pid,
					Format:     interfaces.ExportFormatGeoJSON,
					Pagination: nil, // Test without pagination
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User:             &uid,
						OwningWorkspaces: []accountdomain.WorkspaceID{wid},
					},
				},
			},
			want: func(t *testing.T, result *asset.Asset) {
				assert.NotNil(t, result)
				assert.Equal(t, pid, result.Project())
				assert.Contains(t, result.FileName(), ".geojson")
				assert.True(t, result.Size() > 0)
			},
			wantErr: nil,
		},
		{
			name:       "Export to CSV successfully",
			seedItems:  csvItems,
			seedSchema: testSchema,
			modelID:    csvModelID,
			args: args{
				param: interfaces.ExportModelToAssetsParam{
					ProjectID: pid,
					Format:    interfaces.ExportFormatCSV,
					Pagination: &usecasex.Pagination{
						Cursor: &usecasex.CursorPagination{
							First: lo.ToPtr(int64(5)),
						},
					},
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User:             &uid,
						OwningWorkspaces: []accountdomain.WorkspaceID{wid},
					},
				},
			},
			want: func(t *testing.T, result *asset.Asset) {
				assert.NotNil(t, result)
				assert.Equal(t, pid, result.Project())
				assert.Contains(t, result.FileName(), ".csv")
				assert.True(t, result.Size() > 0)
			},
			wantErr: nil,
		},
		{
			name:       "Invalid operator error",
			seedItems:  jsonItems,
			seedSchema: testSchema,
			modelID:    jsonModelID,
			args: args{
				param: interfaces.ExportModelToAssetsParam{
					ProjectID: pid,
					Format:    interfaces.ExportFormatJSON,
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{}, // No user or integration
				},
			},
			want:    nil,
			wantErr: interfaces.ErrInvalidOperator,
		},
		{
			name:       "Missing model error",
			seedItems:  jsonItems,
			seedSchema: testSchema,
			modelID:    jsonModelID,
			args: args{
				param: interfaces.ExportModelToAssetsParam{
					ProjectID: pid,
					Model:     nil, // Missing model
					Format:    interfaces.ExportFormatJSON,
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User:             &uid,
						OwningWorkspaces: []accountdomain.WorkspaceID{wid},
					},
				},
			},
			want:       nil,
			wantErrMsg: "model is required",
		},
		{
			name:       "Operation denied - no write permission",
			seedItems:  jsonItems,
			seedSchema: testSchema,
			modelID:    jsonModelID,
			args: args{
				param: interfaces.ExportModelToAssetsParam{
					ProjectID: pid,
					Format:    interfaces.ExportFormatJSON,
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User: &uid,
					},
					// No writable workspaces
				},
			},
			want:    nil,
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:       "Unsupported export format error",
			seedItems:  jsonItems,
			seedSchema: testSchema,
			modelID:    jsonModelID,
			args: args{
				param: interfaces.ExportModelToAssetsParam{
					ProjectID: pid,
					Format:    interfaces.ExportFormat("INVALID"), // Invalid format
				},
				operator: &usecase.Operator{
					AcOperator: &accountusecase.Operator{
						User:             &uid,
						OwningWorkspaces: []accountdomain.WorkspaceID{wid},
					},
				},
			},
			want:    nil,
			wantErr: interfaces.ErrUnsupportedExportFormat,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {

			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			if tc.mockItemErr {
				memory.SetItemError(db.Item, tc.wantErr)
			}

			// Create fresh instances for this test to avoid data races
			testProject := project.New().ID(pid).Workspace(wid).MustBuild()
			testModel := model.New().ID(tc.modelID).Schema(testSchema.ID()).Key(id.RandomKey()).Project(pid).MustBuild()

			// Seed project and model
			err := db.Project.Save(ctx, testProject)
			assert.NoError(t, err)
			err = db.Model.Save(ctx, testModel)
			assert.NoError(t, err)
			for _, seed := range tc.seedItems {
				err := db.Item.Save(ctx, seed)
				assert.NoError(t, err)
				// Publish the item by adding Public ref to Latest version
				err = db.Item.UpdateRef(ctx, seed.ID(), version.Public, version.Latest.OrVersion().Ref())
				assert.NoError(t, err)
			}
			if tc.seedSchema != nil {
				err := db.Schema.Save(ctx, tc.seedSchema)
				assert.NoError(t, err)
			}

			// Set the model in the param (needs to be set after model creation)
			// Only set if not testing missing model error
			if tc.wantErrMsg != "model is required" {
				tc.args.param.Model = testModel
			}

			// Create asset use case with file gateway
			g := &gateway.Container{
				File: lo.Must(fs.NewFile(afero.NewMemMapFs(), "", false)),
			}
			assetUC := NewAsset(db, g, ContainerConfig{})
			assetConcrete := assetUC.(*Asset)
			assetConcrete.ignoreEvent = true

			// Call ExportModelToAssets
			result, err := assetConcrete.ExportModelToAssets(ctx, tc.args.param, tc.args.operator)

			if tc.wantErrMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tc.wantErrMsg)
				return
			}
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			if tc.want != nil {
				tc.want(t, result)
			}
		})
	}
}

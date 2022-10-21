package interactor

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"strings"
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type assetTestData struct {
	Now        time.Time
	Op         *usecase.Operator
	UId        id.UserID
	aId1, aId2 id.AssetID
	a1, a2     *asset.Asset
}

func assetTestSuite() assetTestData {
	now := time.Now().Truncate(time.Millisecond).UTC()
	wid := id.NewWorkspaceID()
	uId := id.NewUserID()
	u := user.New().Name("aaa").ID(uId).Email("aaa@bbb.com").Workspace(wid).MustBuild()
	op := &usecase.Operator{
		User:               u.ID(),
		ReadableWorkspaces: nil,
		WritableWorkspaces: nil,
		OwningWorkspaces:   []id.WorkspaceID{wid},
	}
	aId1 := id.NewAssetID()
	aId2 := id.NewAssetID()
	a1 := asset.New().ID(aId1).MustBuild()
	a2 := asset.New().ID(aId2).MustBuild()
	return assetTestData{
		Now:  now,
		Op:   op,
		UId:  uId,
		aId1: aId1,
		aId2: aId2,
		a1:   a1,
		a2:   a2,
	}
}

func TestAsset_FindByID(t *testing.T) {
	pid := id.NewProjectID()

	c := []*asset.File{}
	f := asset.NewFile().Children(c).Build()

	id1 := id.NewAssetID()
	uid1 := id.NewUserID()
	a1 := asset.New().ID(id1).Project(pid).CreatedBy(uid1).Size(1000).File(f).MustBuild()

	op := &usecase.Operator{}

	type args struct {
		id       id.AssetID
		operator *usecase.Operator
	}

	tests := []struct {
		name    string
		seeds   []*asset.Asset
		args    args
		want    *asset.Asset
		wantErr error
	}{
		{
			name:  "Not found in empty db",
			seeds: []*asset.Asset{},
			args: args{
				id:       id.NewAssetID(),
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: []*asset.Asset{
				asset.New().ID(id1).Project(pid).CreatedBy(uid1).Size(1000).File(f).MustBuild(),
			},
			args: args{
				id:       id.NewAssetID(),
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: []*asset.Asset{
				a1,
			},
			args: args{
				id:       id1,
				operator: op,
			},
			want:    a1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: []*asset.Asset{
				a1,
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
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
				assert.Nil(t, err)
			}
			assetUC := NewAsset(db, nil)

			got, err := assetUC.FindByID(ctx, tc.args.id, tc.args.operator)
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
	pid1 := id.NewProjectID()
	uid1 := id.NewUserID()
	id1 := id.NewAssetID()
	id2 := id.NewAssetID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	c := []*asset.File{}
	f := asset.NewFile().Children(c).Build()
	a1 := asset.New().ID(id1).Project(pid1).CreatedAt(tim).CreatedBy(uid1).Size(1000).File(f).MustBuild()
	a2 := asset.New().ID(id2).Project(pid1).CreatedAt(tim).CreatedBy(uid1).Size(1000).File(f).MustBuild()

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
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
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
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
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
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
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
				assert.Nil(t, err)
			}
			assetUC := NewAsset(db, nil)

			got, err := assetUC.FindByIDs(ctx, tc.arg, &usecase.Operator{})
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAsset_FindByProject(t *testing.T) {
	pid := id.NewProjectID()

	c := []*asset.File{}
	f := asset.NewFile().Children(c).Build()

	aid1 := id.NewAssetID()
	uid1 := id.NewUserID()
	a1 := asset.New().ID(aid1).Project(pid).CreatedBy(uid1).Size(1000).File(f).MustBuild()

	aid2 := id.NewAssetID()
	uid2 := id.NewUserID()
	a2 := asset.New().ID(aid2).Project(pid).CreatedBy(uid2).Size(1000).File(f).MustBuild()

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
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
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
					Pagination: usecasex.NewPagination(lo.ToPtr(1), nil, nil, nil),
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
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
			},
			args: args{
				pid: pid,
				f: interfaces.AssetFilter{
					Pagination: usecasex.NewPagination(lo.ToPtr(1), nil, nil, nil),
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
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
			},
			args: args{
				pid: pid,
				f: interfaces.AssetFilter{
					Pagination: usecasex.NewPagination(lo.ToPtr(2), nil, nil, nil),
				},
				operator: op,
			},
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
				assert.Nil(t, err)
			}
			assetUC := NewAsset(db, nil)

			got, _, err := assetUC.FindByProject(ctx, tc.args.pid, tc.args.f, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAsset_Create(t *testing.T) {
	mocktime := time.Now()
	wid1 := id.NewWorkspaceID()

	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).UpdatedAt(mocktime).MustBuild()

	u := user.New().NewID().Name("aaa").Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		User:               u.ID(),
		WritableWorkspaces: []id.WorkspaceID{wid1},
	}

	buf := bytes.NewBufferString("Hello")
	buflen := int64(buf.Len())
	var pti asset.PreviewType = asset.PreviewTypeIMAGE
	var ptg asset.PreviewType = asset.PreviewTypeGEO
	af := asset.NewFile().Name("aaa.txt").Size(uint64(buflen)).Build()

	type args struct {
		cpp      interfaces.CreateAssetParam
		operator *usecase.Operator
	}
	tests := []struct {
		name    string
		seeds   []*asset.Asset
		args    args
		want    *asset.Asset
		wantErr error
	}{
		{
			name:  "Create",
			seeds: []*asset.Asset{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID:   p1.ID(),
					CreatedByID: u.ID(),
					File: &file.File{
						Path:    "aaa.txt",
						Content: io.NopCloser(buf),
						Size:    buflen,
					},
				},
				operator: op,
			},
			want: asset.New().
				NewID().
				Project(p1.ID()).
				CreatedBy(u.ID()).
				FileName("aaa.txt").
				File(af).
				Size(uint64(buflen)).
				Type(&ptg).
				MustBuild(),
			wantErr: nil,
		},
		{
			name:  "Create invalid file size",
			seeds: []*asset.Asset{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID:   p1.ID(),
					CreatedByID: u.ID(),
					File: &file.File{
						Path:    "aaa.txt",
						Content: io.NopCloser(buf),
						Size:    1024*1024*100 + 1,
					},
				},
				operator: op,
			},
			want:    nil,
			wantErr: gateway.ErrFileTooLarge,
		},
		{
			name:  "Create invalid file",
			seeds: []*asset.Asset{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID:   p1.ID(),
					CreatedByID: u.ID(),
					File:        nil,
				},
				operator: op,
			},
			want:    nil,
			wantErr: interfaces.ErrFileNotIncluded,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			mfs := afero.NewMemMapFs()
			f, _ := fs.NewFile(mfs, "", "")

			err := db.User.Save(ctx, u)
			assert.Nil(t, err)

			err2 := db.Project.Save(ctx, p1.Clone())
			assert.Nil(t, err2)

			for _, a := range tc.seeds {
				err := db.Asset.Save(ctx, a.Clone())
				assert.Nil(t, err)
			}
			assetUC := NewAsset(db, &gateway.Container{
				File: f,
			})

			got, err := assetUC.Create(ctx, tc.args.cpp, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)

			if strings.HasPrefix(got.PreviewType().String(), "image/") {
				assert.Equal(t, &pti, got.PreviewType())
			} else {
				assert.Equal(t, &ptg, got.PreviewType())
			}

			assert.Equal(t, tc.want.Project(), got.Project())
			assert.Equal(t, tc.want.FileName(), got.FileName())
			assert.Equal(t, tc.want.Size(), got.Size())
			assert.Equal(t, tc.want.File(), got.File())
			assert.Equal(t, tc.want.PreviewType(), got.PreviewType())

			dbGot, err := db.Asset.FindByID(ctx, got.ID())
			assert.Nil(t, err)
			assert.Equal(t, tc.want.Project(), dbGot.Project())
			assert.Equal(t, tc.want.FileName(), dbGot.FileName())
			assert.Equal(t, tc.want.Size(), dbGot.Size())
			assert.Equal(t, tc.want.File(), dbGot.File())
			assert.Equal(t, tc.want.PreviewType(), dbGot.PreviewType())
		})
	}
}

func TestAsset_Update(t *testing.T) {
	uid := id.NewUserID()
	var pti asset.PreviewType = asset.PreviewTypeIMAGE
	var ptg asset.PreviewType = asset.PreviewTypeGEO

	pid1 := id.NewProjectID()
	aid1 := id.NewAssetID()
	a1 := asset.New().ID(aid1).Project(pid1).CreatedBy(uid).Size(1000).MustBuild()
	a1Updated := asset.New().ID(aid1).Project(pid1).CreatedBy(uid).Size(1000).Type(&pti).MustBuild()

	pid2 := id.NewProjectID()
	aid2 := id.NewAssetID()
	a2 := asset.New().ID(aid2).Project(pid2).CreatedBy(uid).Size(1000).MustBuild()

	op := &usecase.Operator{}

	type args struct {
		upp      interfaces.UpdateAssetParam
		operator *usecase.Operator
	}
	tests := []struct {
		name    string
		seeds   []*asset.Asset
		args    args
		want    *asset.Asset
		wantErr error
	}{
		{
			name:  "update",
			seeds: []*asset.Asset{a1, a2},
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
			seeds: []*asset.Asset{a1, a2},
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
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			for _, p := range tc.seeds {
				err := db.Asset.Save(ctx, p.Clone())
				assert.Nil(t, err)
			}
			assetUC := NewAsset(db, &gateway.Container{})

			got, err := assetUC.Update(ctx, tc.args.upp, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAsset_UpdateFiles(t *testing.T) {
	uid := id.NewUserID()
	assetID1 := asset.NewID()
	assetID2 := asset.NewID()
	projectID := id.NewProjectID()

	c1 := asset.NewFile().Name("hello").Path("/51/30c89f-8f67-4766-b127-49ee6796d464/xxx/yyy/hello.txt").GuessContentType().Build()
	c2 := asset.NewFile().Name("zzz").Path("/51/30c89f-8f67-4766-b127-49ee6796d464/xxx/zzz.txt").GuessContentType().Build()
	f1 := asset.NewFile().Name("xxx").Path("/51/30c89f-8f67-4766-b127-49ee6796d464/xxx.zip").GuessContentType().Children([]*asset.File{c1, c2}).Build()

	a1 := asset.New().ID(assetID1).Project(projectID).CreatedBy(uid).Size(1000).UUID("5130c89f-8f67-4766-b127-49ee6796d464").File(f1).MustBuild()

	a2 := asset.New().ID(assetID2).Project(projectID).CreatedBy(uid).Size(1000).UUID("5130c89f-8f67-4766-b127-49ee6796d464").MustBuild()

	op := &usecase.Operator{}

	fmt.Print(a1, a2)
	tests := []struct {
		name            string
		seedAssets      []*asset.Asset
		prepareFileFunc func() afero.Fs
		assetID         id.AssetID
		want            *asset.Asset
		wantErr         error
	}{
		// {
		// 	name: "update asset not found",
		// 	prepareFileFunc: func() afero.Fs {
		// 		return mockFs()
		// 	},
		// 	want:    nil,
		// 	wantErr: rerror.ErrNotFound,
		// },
		// {
		// 	name:       "update file not found",
		// 	seedAssets: []*asset.Asset{a1, a2},
		// 	prepareFileFunc: func() afero.Fs {
		// 		return afero.NewMemMapFs()
		// 	},
		// 	assetID: assetID1,
		// 	want:    nil,
		// 	wantErr: gateway.ErrFileNotFound,
		// },
		{
			name:       "update",
			seedAssets: []*asset.Asset{a1, a2},
			prepareFileFunc: func() afero.Fs {
				return mockFs()
			},
			assetID: assetID1,
			want:    asset.New().ID(assetID1).Project(projectID).CreatedBy(uid).Size(1000).UUID("5130c89f-8f67-4766-b127-49ee6796d464").File(f1).MustBuild(),
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			fileGw := lo.Must(fs.NewFile(tc.prepareFileFunc(), "", ""))

			for _, p := range tc.seedAssets {
				err := db.Asset.Save(ctx, p.Clone())
				assert.Nil(t, err)
			}
			assetUC := NewAsset(db, &gateway.Container{File: fileGw})

			got, err := assetUC.UpdateFiles(ctx, tc.assetID, op)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAsset_Delete(t *testing.T) {
	uid := id.NewUserID()

	pid1 := id.NewProjectID()
	aid1 := id.NewAssetID()
	a1 := asset.New().ID(aid1).Project(pid1).CreatedBy(uid).Size(1000).MustBuild()

	pid2 := id.NewProjectID()
	aid2 := id.NewAssetID()
	a2 := asset.New().ID(aid2).Project(pid2).CreatedBy(uid).Size(1000).MustBuild()

	op := &usecase.Operator{}

	type args struct {
		id       id.AssetID
		operator *usecase.Operator
	}
	tests := []struct {
		name         string
		seeds        []*asset.Asset
		args         args
		want         []*asset.Asset
		mockAssetErr bool
		wantErr      error
	}{
		{
			name:  "delete",
			seeds: []*asset.Asset{a1, a2},
			args: args{
				id:       aid1,
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "delete not found",
			seeds: []*asset.Asset{a1, a2},
			args: args{
				id:       id.NewAssetID(),
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "delete od",
			seeds: []*asset.Asset{},
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

			for _, p := range tc.seeds {
				err := db.Asset.Save(ctx, p.Clone())
				assert.Nil(t, err)
			}
			assetUC := NewAsset(db, &gateway.Container{})

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

type file2 struct {
	gateway.File
}

func (f *file2) GetURL(*asset.Asset) string {
	return "xxx"
}

func TestAsset_GetURL(t *testing.T) {
	uc := &Asset{
		gateways: &gateway.Container{
			File: &file2{},
		},
	}
	assert.Equal(t, "xxx", uc.GetURL(nil))
}

func mockFs() afero.Fs {
	files := map[string]string{
		"assets/51/30c89f-8f67-4766-b127-49ee6796d464/xxx.zip":           "xxx",
		"assets/51/30c89f-8f67-4766-b127-49ee6796d464/xxx/zzz.txt":       "zzz",
		"assets/51/30c89f-8f67-4766-b127-49ee6796d464/xxx/yyy/hello.txt": "hello",
		"plugins/aaa~1.0.0/foo.js":                                       "bar",
		"published/s.json":                                               "{}",
	}

	fs := afero.NewMemMapFs()
	for name, content := range files {
		f, _ := fs.Create(name)
		_, _ = f.WriteString(content)
		_ = f.Close()
	}
	return fs
}

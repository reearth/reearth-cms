package interactor

import (
	"bytes"
	"context"
	"io"
	"strings"
	"testing"

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
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

func TestAsset_Fetch(t *testing.T) {
	pid1 := id.NewProjectID()
	pid2 := id.NewProjectID()

	aid1 := id.NewAssetID()
	uid1 := id.NewUserID()
	a1 := asset.New().ID(aid1).Project(pid1).CreatedBy(uid1).Size(1000).MustBuild()

	aid2 := id.NewAssetID()
	uid2 := id.NewUserID()
	a2 := asset.New().ID(aid2).Project(pid2).CreatedBy(uid2).Size(1000).MustBuild()

	op := &usecase.Operator{}

	type args struct {
		ids      []id.AssetID
		operator *usecase.Operator
	}
	tests := []struct {
		name    string
		seeds   []*asset.Asset
		args    args
		want    []*asset.Asset
		wantErr error
	}{
		{
			name:  "Fetch 1 of 2",
			seeds: []*asset.Asset{a1, a2},
			args: args{
				ids:      []id.AssetID{aid1},
				operator: op,
			},
			want:    []*asset.Asset{a1},
			wantErr: nil,
		},
		{
			name:  "Fetch 2 of 2",
			seeds: []*asset.Asset{a1, a2},
			args: args{
				ids:      []id.AssetID{aid1, aid2},
				operator: op,
			},
			want:    []*asset.Asset{a1, a2},
			wantErr: nil,
		},
		{
			name:  "Fetch 1 of 0",
			seeds: []*asset.Asset{},
			args: args{
				ids:      []id.AssetID{aid1},
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name:  "Fetch 2 of 0",
			seeds: []*asset.Asset{},
			args: args{
				ids:      []id.AssetID{aid1, aid2},
				operator: op,
			},
			want:    nil,
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

			got, err := assetUC.Fetch(ctx, tc.args.ids, &usecase.Operator{})
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAsset_FindByID(t *testing.T) {
	pid := id.NewProjectID()

	f := asset.File{}
	c := []*asset.File{}
	f.SetChildren(c...)

	id1 := id.NewAssetID()
	uid1 := id.NewUserID()
	a1 := asset.New().ID(id1).Project(pid).CreatedBy(uid1).Size(1000).File(&f).MustBuild()

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
				asset.New().ID(id1).Project(pid).CreatedBy(uid1).Size(1000).File(&f).MustBuild(),
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
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(&f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(&f).MustBuild(),
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

func TestAsset_FindByProject(t *testing.T) {
	pid := id.NewProjectID()

	f := asset.File{}
	c := []*asset.File{}
	f.SetChildren(c...)

	aid1 := id.NewAssetID()
	uid1 := id.NewUserID()
	a1 := asset.New().ID(aid1).Project(pid).CreatedBy(uid1).Size(1000).File(&f).MustBuild()

	aid2 := id.NewAssetID()
	uid2 := id.NewUserID()
	a2 := asset.New().ID(aid2).Project(pid).CreatedBy(uid2).Size(1000).File(&f).MustBuild()

	op := &usecase.Operator{}

	type args struct {
		pid      id.ProjectID
		f        interfaces.AssetFilter
		operator *usecase.Operator
	}
	tests := []struct {
		name    string
		seeds   []*asset.Asset
		args    args
		want    []*asset.Asset
		wantErr error
	}{
		{
			name:  "0 count in empty db",
			seeds: []*asset.Asset{},
			args: args{
				pid:      id.NewProjectID(),
				operator: op,
			},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with asset for another projects",
			seeds: []*asset.Asset{
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(&f).MustBuild(),
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
			seeds: []*asset.Asset{
				a1,
			},
			args: args{
				pid: pid,
				f: interfaces.AssetFilter{
					Pagination: usecasex.NewPagination(lo.ToPtr(1), nil, nil, nil),
				},
				operator: op,
			},
			want:    []*asset.Asset{a1},
			wantErr: nil,
		},
		{
			name: "1 count with multi assets",
			seeds: []*asset.Asset{
				a1,
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(&f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(&f).MustBuild(),
			},
			args: args{
				pid: pid,
				f: interfaces.AssetFilter{
					Pagination: usecasex.NewPagination(lo.ToPtr(1), nil, nil, nil),
				},
				operator: op,
			},
			want:    []*asset.Asset{a1},
			wantErr: nil,
		},
		{
			name: "2 count with multi assets",
			seeds: []*asset.Asset{
				a1,
				a2,
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(&f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(&f).MustBuild(),
			},
			args: args{
				pid: pid,
				f: interfaces.AssetFilter{
					Pagination: usecasex.NewPagination(lo.ToPtr(2), nil, nil, nil),
				},
				operator: op,
			},
			want:    []*asset.Asset{a1, a2},
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
	pid := id.NewProjectID()
	uid := id.NewUserID()
	op := &usecase.Operator{}
	buf := bytes.NewBufferString("Hello")
	buflen := int64(buf.Len())
	var pti asset.PreviewType = asset.PreviewTypeIMAGE
	var ptg asset.PreviewType = asset.PreviewTypeGEO
	af := &asset.File{}
	af.SetName("aaa.txt")
	af.SetSize(uint64(buflen))

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
					ProjectID:   pid,
					CreatedByID: uid,
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
				Project(pid).
				CreatedBy(uid).
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
					ProjectID:   pid,
					CreatedByID: uid,
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
			name:  "Create invalid file size",
			seeds: []*asset.Asset{},
			args: args{
				cpp: interfaces.CreateAssetParam{
					ProjectID:   pid,
					CreatedByID: uid,
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
			f, _ := fs.NewFile(mfs, "")

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

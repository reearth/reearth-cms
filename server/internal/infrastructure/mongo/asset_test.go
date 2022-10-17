package mongo

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestAssetRepo_FindByID(t *testing.T) {
	pid1 := id.NewProjectID()
	uid1 := id.NewUserID()
	id1 := id.NewAssetID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	c := []*asset.File{}
	f := asset.NewFile().Children(c).Build()
	a1 := asset.New().ID(id1).Project(pid1).CreatedAt(tim).CreatedBy(uid1).Size(1000).File(f).MustBuild()

	tests := []struct {
		name    string
		seeds   []*asset.Asset
		arg     id.AssetID
		want    *asset.Asset
		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   []*asset.Asset{},
			arg:     id.NewAssetID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: []*asset.Asset{
				asset.New().ID(id1).Project(pid1).CreatedBy(uid1).Size(1000).File(f).MustBuild(),
			},
			arg:     id.NewAssetID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: []*asset.Asset{
				a1,
			},
			arg:     id1,
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
			arg:     id1,
			want:    a1,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewAsset(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.Nil(t, err)
			}

			got, err := r.FindByID(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAssetRepo_FindByIDs(t *testing.T) {
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
		seeds   []*asset.Asset
		arg     id.AssetIDList
		want    []*asset.Asset
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   []*asset.Asset{},
			arg:     []id.AssetID{},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with asset for another workspaces",
			seeds: []*asset.Asset{
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
			},
			arg:     []id.AssetID{},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single asset",
			seeds: []*asset.Asset{
				a1,
			},
			arg:     []id.AssetID{id1},
			want:    []*asset.Asset{a1},
			wantErr: nil,
		},
		{
			name: "1 count with multi assets",
			seeds: []*asset.Asset{
				a1,
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
			},
			arg:     []id.AssetID{id1},
			want:    []*asset.Asset{a1},
			wantErr: nil,
		},
		{
			name: "2 count with multi assets",
			seeds: []*asset.Asset{
				a1,
				a2,
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
			},
			arg:     []id.AssetID{id1, id2},
			want:    []*asset.Asset{a1, a2},
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewAsset(client)
			ctx := context.Background()
			for _, a := range tc.seeds {
				err := r.Save(ctx, a)
				assert.Nil(t, err)
			}

			got, err := r.FindByIDs(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAssetRepo_FindByProject(t *testing.T) {
	pid1 := id.NewProjectID()
	uid1 := id.NewUserID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	c := []*asset.File{}
	f := asset.NewFile().Children(c).Build()
	a1 := asset.New().NewID().Project(pid1).CreatedAt(tim).CreatedBy(uid1).Size(1000).File(f).MustBuild()
	a2 := asset.New().NewID().Project(pid1).CreatedAt(tim).CreatedBy(uid1).Size(1000).File(f).MustBuild()

	type args struct {
		tid   id.ProjectID
		pInfo *usecasex.Pagination
	}
	tests := []struct {
		name    string
		seeds   []*asset.Asset
		args    args
		want    []*asset.Asset
		wantErr error
	}{
		{
			name:    "0 count in empty db",
			seeds:   []*asset.Asset{},
			args:    args{id.NewProjectID(), nil},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "0 count with asset for another projects",
			seeds: []*asset.Asset{
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
			},
			args:    args{id.NewProjectID(), nil},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "1 count with single asset",
			seeds: []*asset.Asset{
				a1,
			},
			args:    args{pid1, usecasex.NewPagination(lo.ToPtr(1), nil, nil, nil)},
			want:    []*asset.Asset{a1},
			wantErr: nil,
		},
		{
			name: "1 count with multi assets",
			seeds: []*asset.Asset{
				a1,
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
			},
			args:    args{pid1, usecasex.NewPagination(lo.ToPtr(1), nil, nil, nil)},
			want:    []*asset.Asset{a1},
			wantErr: nil,
		},
		{
			name: "2 count with multi assets",
			seeds: []*asset.Asset{
				a1,
				a2,
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
			},
			args:    args{pid1, usecasex.NewPagination(lo.ToPtr(2), nil, nil, nil)},
			want:    []*asset.Asset{a1, a2},
			wantErr: nil,
		},
		{
			name: "get 1st page of 2",
			seeds: []*asset.Asset{
				a1,
				a2,
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
			},
			args:    args{pid1, usecasex.NewPagination(lo.ToPtr(1), nil, nil, nil)},
			want:    []*asset.Asset{a1},
			wantErr: nil,
		},
		{
			name: "get last page of 2",
			seeds: []*asset.Asset{
				a1,
				a2,
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(f).MustBuild(),
			},
			args:    args{pid1, usecasex.NewPagination(nil, lo.ToPtr(1), nil, nil)},
			want:    []*asset.Asset{a2},
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewAsset(client)
			ctx := context.Background()
			for _, a := range tc.seeds {
				err := r.Save(ctx, a)
				assert.Nil(t, err)
			}

			got, _, err := r.FindByProject(ctx, tc.args.tid, repo.AssetFilter{Pagination: tc.args.pInfo})
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}

			assert.Equal(t, tc.want, got)
		})
	}
}

func TestAssetRepo_Delete(t *testing.T) {
	pid1 := id.NewProjectID()
	uid1 := id.NewUserID()
	id1 := id.NewAssetID()
	f := asset.File{}
	a1 := asset.New().ID(id1).Project(pid1).CreatedBy(uid1).Size(1000).File(&f).MustBuild()
	tests := []struct {
		name  string
		seeds []*asset.Asset
		arg   id.AssetID

		wantErr error
	}{
		{
			name:    "Not found in empty db",
			seeds:   []*asset.Asset{},
			arg:     id.NewAssetID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: []*asset.Asset{
				asset.New().NewID().Project(pid1).CreatedBy(uid1).Size(1000).File(&f).MustBuild(),
			},
			arg:     id.NewAssetID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: []*asset.Asset{
				a1,
			},
			arg:     id1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: []*asset.Asset{
				a1,
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(&f).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).File(&f).MustBuild(),
			},
			arg:     id1,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewAsset(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.Nil(t, err)
			}

			err := r.Delete(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.Nil(t, err)
			_, err = r.FindByID(ctx, tc.arg)
			assert.ErrorIs(t, err, rerror.ErrNotFound)
		})
	}
}

func TestAssetRepo_Save(t *testing.T) {
	pid1 := id.NewProjectID()
	uid1 := id.NewUserID()
	id1 := id.NewAssetID()
	f := asset.File{}
	a1 := asset.New().ID(id1).Project(pid1).CreatedBy(uid1).Size(1000).File(&f).MustBuild()
	tests := []struct {
		name    string
		seeds   []*asset.Asset
		arg     *asset.Asset
		want    *asset.Asset
		wantErr error
	}{
		{
			name: "Saved",
			seeds: []*asset.Asset{
				a1,
			},
			arg:     a1,
			want:    a1,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			// t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewAsset(client)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				if tc.wantErr != nil {
					assert.ErrorIs(t, err, tc.wantErr)
					return
				}
			}

			err := r.Save(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
		})
	}
}

package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"

	repo "github.com/reearth/reearth-cms/server/internal/usecase/repo"
)

func TestAsset_FindByID(t *testing.T) {
	expected := asset.New().
		NewID().
		Project(id.NewProjectID()).
		CreatedBy(id.NewUserID()).
		FileName("name").
		Size(10).
		UUID("https://reearth.io/").
		MustBuild()

	init := mongotest.Connect(t)
	client := init(t)

	repo := NewAsset(mongox.NewClientWithDatabase(client))
	ctx := context.Background()
	err := repo.Save(ctx, expected)
	assert.NoError(t, err)

	got, err := repo.FindByID(ctx, expected.ID())
	assert.NoError(t, err)
	assert.Equal(t, expected, got)
}

func TestAsset_FindByIDs(t *testing.T) {
	a := asset.New().
		NewID().
		Project(id.NewProjectID()).
		CreatedBy(id.NewUserID()).
		FileName("name").
		Size(10).
		UUID("https://reearth.io/").
		MustBuild()

	expected := []*asset.Asset{
		a,
	}

	init := mongotest.Connect(t)
	client := init(t)

	repo := NewAsset(mongox.NewClientWithDatabase(client))
	ctx := context.Background()
	err := repo.Save(ctx, a)
	assert.NoError(t, err)

	ids := []idx.ID[id.Asset]{
		a.ID(),
	}
	got, err := repo.FindByIDs(ctx, ids)
	assert.NoError(t, err)
	assert.Equal(t, expected, got)

	got2, err2 := repo.FindByIDs(ctx, nil)
	assert.NoError(t, err2)
	assert.Nil(t, err2)
	assert.Nil(t, got2)
}

func TestAsset_NewAsset(t *testing.T) {
	init := mongotest.Connect(t)
	client := init(t)

	r := NewAsset(mongox.NewClientWithDatabase(client))
	assert.NotNil(t, r)
}

func TestAsset_FindByProject(t *testing.T) {
	pid := id.NewProjectID()
	a1 := asset.New().
		NewID().
		Project(pid).
		CreatedBy(id.NewUserID()).
		FileName("xxx").
		Size(10).
		MustBuild()

	expected := []*asset.Asset{}
	expected = append(expected, a1)

	init := mongotest.Connect(t)
	client := init(t)

	r := NewAsset(mongox.NewClientWithDatabase(client))
	ctx := context.Background()
	err1 := r.Save(ctx, a1)
	assert.NoError(t, err1)

	got, i, err := r.FindByProject(ctx, pid, repo.AssetFilter{})
	assert.NoError(t, err)
	assert.NotNil(t, i)
	assert.Equal(t, expected, got)
}

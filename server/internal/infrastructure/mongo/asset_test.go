package mongo

// import (
// 	"context"
// 	"testing"

// 	"github.com/reearth/reearth-cms/server/pkg/asset"
// 	"github.com/reearth/reearth-cms/server/pkg/id"
// 	"github.com/stretchr/testify/assert"
// )

// func TestFindByID(t *testing.T) {
// 	expected := asset.New().
// 		NewID().
// 		Project(id.NewProjectID()).
// 		CreatedBy(id.NewUserID()).
// 		FileName("name").
// 		Size(10).
// 		Hash("https://reearth.io/").
// 		MustBuild()

// 	init := connect(t)
// 	client := init(t)

// 	repo := NewAsset(client)
// 	ctx := context.Background()
// 	err := repo.Save(ctx, expected)
// 	assert.NoError(t, err)

// 	got, err := repo.FindByID(ctx, expected.ID())
// 	assert.NoError(t, err)
// 	assert.Equal(t, expected, got)
// }

package mongo

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
)

func TestSchemaRepo_FindByFieldIDs(t *testing.T) {
	pid := id.NewProjectID()
	mocknow := time.Now().Truncate(time.Millisecond).UTC()
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).UpdatedAt(mocknow).NewID().Key(key.Random()).MustBuild()
	s1 := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(pid).Fields(schema.FieldList{sf1}).MustBuild()

	ctx := context.Background()
	initDB := mongotest.Connect(t)
	client := mongox.NewClientWithDatabase(initDB(t))
	r := NewSchema(client)

	err := r.Save(ctx, s1.Clone())
	assert.Nil(t, err)

	ids1 := id.FieldIDList{sf1.ID()}
	want1 := schema.List{s1}
	got1, err1 := r.FindByFieldIDs(ctx, ids1)
	assert.Equal(t, want1, got1)
	assert.Nil(t, err1)

	ids2 := id.FieldIDList{}
	got2, err2 := r.FindByFieldIDs(ctx, ids2)
	assert.Nil(t, got2)
	assert.Nil(t, err2)

	ids3 := id.FieldIDList{}
	got3, err3 := r.FindByFieldIDs(ctx, ids3)
	assert.Nil(t, got3)
	assert.Nil(t, err3)
}

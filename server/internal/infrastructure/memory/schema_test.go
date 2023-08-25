package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestSchemaRepo_FindFieldByIDs(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s1 := schema.New().NewID().Workspace(wid).Project(pid).Fields(schema.FieldList{sf1}).MustBuild()
	f1 := item.NewField(sf1.ID(), value.TypeBool.Value(true).AsMultiple())
	i1 := item.New().NewID().
		Schema(s1.ID()).
		Model(id.NewModelID()).
		Project(pid).
		Fields([]*item.Field{
			f1,
		}).
		Thread(id.NewThreadID()).
		MustBuild()

	ctx := context.Background()
	r := NewSchema()
	serr1 := r.Save(ctx, s1.Clone())
	assert.Nil(t, serr1)
	i := NewItem()
	serr2 := i.Save(ctx, i1)
	assert.Nil(t, serr2)

	ids1 := id.FieldIDList{sf1.ID()}
	want1 := []*schema.Field{sf1}
	got1, err1 := r.FindFieldByIDs(ctx, ids1)
	assert.Equal(t, want1, got1)
	assert.Nil(t, err1)

	ids2 := id.FieldIDList{}
	got2, err2 := r.FindFieldByIDs(ctx, ids2)
	assert.Nil(t, got2)
	assert.Nil(t, err2)
}

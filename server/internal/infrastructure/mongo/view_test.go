package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
)

func TestViewRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestViewRepo(t, func(t *testing.T) repo.View {
		return NewView(mongox.NewClientWithDatabase(init(t)))
	})
}

func TestView_UnreadableFilters(t *testing.T) {
	init := mongotest.Connect(t)
	ctx := context.Background()
	client := mongox.NewClientWithDatabase(init(t))
	coll := client.WithCollection("view").Client()
	r := NewView(client)

	pid, mid := id.NewProjectID(), id.NewModelID()
	valid := view.New().NewID().Project(pid).Model(mid).Schema(id.NewSchemaID()).
		User(accountdomain.NewUserID()).Columns(&view.ColumnList{}).MustBuild()
	require.NoError(t, r.Save(ctx, valid))

	brokenID := id.NewViewID()
	unreadable := &mongodoc.FilterDocument{ConditionType: "UNKNOWN"}
	_, err := coll.InsertOne(ctx, mongodoc.ViewDocument{
		ID: brokenID.String(), Project: pid.String(), ModelId: mid.String(), Schema: id.NewSchemaID().String(),
		User: accountdomain.NewUserID().String(), Order: 1, Filter: unreadable,
	})
	require.NoError(t, err)
	stored := func() *mongodoc.FilterDocument {
		var d mongodoc.ViewDocument
		require.NoError(t, coll.FindOne(ctx, bson.M{"id": brokenID.String()}).Decode(&d))
		return d.Filter
	}

	// the view is loaded without its filter, so it is still listed and counted
	got, err := r.FindByModel(ctx, mid)
	require.NoError(t, err)
	assert.Equal(t, id.ViewIDList{valid.ID(), brokenID}, id.ViewIDList{got[0].ID(), got[1].ID()})
	broken, err := r.FindByID(ctx, brokenID)
	require.NoError(t, err)
	assert.Nil(t, broken.Filter())

	// saving it unchanged keeps the stored filter
	broken.SetName("renamed")
	require.NoError(t, r.Save(ctx, broken))
	require.NoError(t, r.SaveAll(ctx, view.List{valid, broken}))
	assert.Equal(t, unreadable, stored())

	// a new filter replaces it
	f := view.Condition{ConditionType: view.ConditionTypeBool, BoolCondition: &view.BoolCondition{Value: true}}
	broken.SetFilter(&f)
	require.NoError(t, r.Save(ctx, broken))
	assert.Equal(t, "BOOL", stored().ConditionType)

	// and the view can be removed
	assert.NoError(t, r.Remove(ctx, brokenID))
}

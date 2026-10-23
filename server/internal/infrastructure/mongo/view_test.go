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
)

func TestViewRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestViewRepo(t, func(t *testing.T) repo.View {
		return NewView(mongox.NewClientWithDatabase(init(t)))
	})
}

func TestView_SkipsViewsWithInvalidFilters(t *testing.T) {
	init := mongotest.Connect(t)
	ctx := context.Background()
	client := mongox.NewClientWithDatabase(init(t))
	r := NewView(client)

	pid, mid := id.NewProjectID(), id.NewModelID()
	valid := view.New().NewID().Project(pid).Model(mid).Schema(id.NewSchemaID()).
		User(accountdomain.NewUserID()).Columns(&view.ColumnList{}).MustBuild()
	require.NoError(t, r.Save(ctx, valid))

	brokenID := id.NewViewID()
	_, err := client.WithCollection("view").Client().InsertOne(ctx, mongodoc.ViewDocument{
		ID: brokenID.String(), Project: pid.String(), ModelId: mid.String(), Schema: id.NewSchemaID().String(),
		User: accountdomain.NewUserID().String(), Order: 1,
		Filter: &mongodoc.FilterDocument{ConditionType: "UNKNOWN"},
	})
	require.NoError(t, err)

	// listings skip the broken view
	got, err := r.FindByModel(ctx, mid)
	require.NoError(t, err)
	require.Len(t, got, 1)
	assert.Equal(t, valid.ID(), got[0].ID())

	got, err = r.FindByIDs(ctx, id.ViewIDList{brokenID, valid.ID()})
	assert.NoError(t, err)
	assert.Len(t, got, 1)

	// a direct read reports it
	_, err = r.FindByID(ctx, brokenID)
	assert.ErrorIs(t, err, mongodoc.ErrInvalidFilterDocument)
}

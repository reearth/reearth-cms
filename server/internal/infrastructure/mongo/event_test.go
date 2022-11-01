package mongo

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
)

func TestEvent_Save(t *testing.T) {
	now := time.Now().Truncate(time.Millisecond).UTC()
	u := user.New().NewID().Email("hoge@example.com").Name("John").MustBuild()
	a := asset.New().NewID().Project(project.NewID()).Size(100).CreatedAt(now).CreatedBy(u.ID()).File(asset.NewFile().Name("aaa.txt").Path("/aaa.txt").Size(100).Build()).MustBuild()
	eID := event.NewID()
	ev := event.New[any]().ID(eID).Timestamp(now).Type("asset.create").Operator(event.OperatorFromUser(u.ID())).Object(a).MustBuild()

	initDB := mongotest.Connect(t)

	client := mongox.NewClientWithDatabase(initDB(t))
	r := NewEvent(client)
	ctx := context.Background()
	err := r.Save(ctx, ev)
	assert.NoError(t, err)

	got, err := r.FindByID(ctx, eID)
	assert.Equal(t, ev, got)
	assert.NoError(t, err)

}

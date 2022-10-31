package event

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestEvent(t *testing.T) {
	u := user.New().NewID().Email("hoge@example.com").Name("John").MustBuild()
	a := asset.New().NewID().Project(project.NewID()).Size(100).CreatedBy(u.ID()).File(asset.NewFile().Name("aaa.txt").Path("/aaa.txt").Size(100).Build()).MustBuild()
	now := time.Now()
	eID := NewID()
	ev := New[*asset.Asset]().ID(eID).Timestamp(now).Type("asset.create").Operator(OperatorFromUser(u.ID())).Object(a).MustBuild()

	assert.Equal(t, eID, ev.ID())
	assert.Equal(t, Type("asset.create"), ev.Type())
	assert.Equal(t, OperatorFromUser(u.ID()), ev.Operator())
	assert.Equal(t, a, ev.Object())
	assert.Equal(t, now, ev.Timestamp())

}

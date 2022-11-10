package event

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
)

var (
	u = user.New().NewID().Email("hoge@example.com").Name("John").MustBuild()
	a = asset.New().NewID().Project(project.NewID()).Size(100).CreatedByUser(u.ID()).File(asset.NewFile().Name("aaa.txt").Path("/aaa.txt").Size(100).Build()).Thread(id.NewThreadID()).MustBuild()
)

func TestBuilder(t *testing.T) {
	now := time.Now()
	id := NewID()

	ev := New[*asset.Asset]().ID(id).Timestamp(now).Type(AssetCreate).Operator(OperatorFromUser(u.ID())).Object(a).MustBuild()
	ev2 := New[*asset.Asset]().NewID().Timestamp(now).Type(AssetDecompress).Operator(OperatorFromUser(u.ID())).Object(a).MustBuild()

	// ev1
	assert.Equal(t, id, ev.ID())
	assert.Equal(t, Type(AssetCreate), ev.Type())
	assert.Equal(t, OperatorFromUser(u.ID()), ev.Operator())
	assert.Equal(t, a, ev.Object())

	// ev2
	assert.NotNil(t, ev2.ID())

	ev3, err := New[*asset.Asset]().Build()
	assert.Equal(t, ErrInvalidID, err)
	assert.Nil(t, ev3)
}

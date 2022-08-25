package mongogit

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestApplyQuery(t *testing.T) {
	v := version.New()
	assert.Equal(
		t,
		bson.M{"$and": []any{bson.M{"a": "b"}, bson.M{refsKey: bson.M{"$in": []string{"latest"}}}}},
		applyQuery(nil, bson.M{"a": "b"}),
	)
	assert.Equal(
		t,
		bson.M{"$and": []any{bson.M{"a": "b"}, bson.M{versionKey: v}}},
		applyQuery(v.OrRef().Ref(), bson.M{"a": "b"}),
	)
}

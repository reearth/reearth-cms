package mongogit

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestQuery_Apply(t *testing.T) {
	v := version.New()
	assert.Equal(
		t,
		bson.M{
			"a":     "b",
			metaKey: bson.M{"$exists": false},
		},
		All().apply(bson.M{"a": "b"}),
	)
	assert.Equal(
		t,
		bson.M{"$and": []any{
			bson.M{
				"a":     "b",
				metaKey: bson.M{"$exists": false},
			},
			bson.M{versionKey: v}},
		},
		Eq(v.OrRef()).apply(bson.M{"a": "b"}),
	)
	assert.Equal(
		t,
		bson.M{"$and": []any{
			bson.M{
				"a":     "b",
				metaKey: bson.M{"$exists": false},
			},
			bson.M{refsKey: bson.M{"$in": []string{"latest"}}}},
		},
		Eq(version.Latest.OrVersion()).apply(bson.M{"a": "b"}),
	)
}

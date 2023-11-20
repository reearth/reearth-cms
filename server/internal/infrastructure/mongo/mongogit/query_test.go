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
			"a": "b",
		},
		apply(version.All(), bson.M{"a": "b"}),
	)
	assert.Equal(
		t,
		bson.M{"$and": []any{
			bson.M{
				"a": "b",
			},
			bson.M{versionKey: v}},
		},
		apply(version.Eq(v.OrRef()), bson.M{"a": "b"}),
	)
	assert.Equal(
		t,
		bson.M{"$and": []any{
			bson.M{
				"a": "b",
			},
			bson.M{refsKey: bson.M{"$in": []string{"latest"}}}},
		},
		apply(version.Eq(version.Latest.OrVersion()), bson.M{"a": "b"}),
	)
}

func TestQuery_ApplyToPipeline(t *testing.T) {
	v := version.New()
	assert.Equal(
		t,
		[]any{
			bson.M{"a": "b"},
		},
		applyToPipeline(version.All(), []any{bson.M{"a": "b"}}),
	)
	assert.Equal(
		t,
		[]any{
			bson.M{"a": "b"},
			bson.M{
				"$match": bson.M{
					versionKey: v,
				},
			},
		},
		applyToPipeline(version.Eq(v.OrRef()), []any{bson.M{"a": "b"}}),
	)
	assert.Equal(
		t,
		[]any{
			bson.M{"a": "b"},
			bson.M{
				"$match": bson.M{
					refsKey: bson.M{"$in": []string{"latest"}},
				},
			},
		},
		applyToPipeline(version.Eq(version.Latest.OrVersion()), []any{bson.M{"a": "b"}}),
	)
}

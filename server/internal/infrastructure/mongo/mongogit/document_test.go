package mongogit

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestMeta_Apply(t *testing.T) {
	v1, v2 := version.New(), version.New()
	got, err := Meta{
		Version: v1,
		Parents: []version.Version{v2},
		Refs:    []version.Ref{version.Latest},
	}.Apply(bson.M{
		"a": 1,
	})
	assert.NoError(t, err)
	assert.Equal(t, bson.D{
		{Key: "a", Value: int32(1)},
		{Key: versionKey, Value: v1},
		{Key: parentsKey, Value: []version.Version{v2}},
		{Key: refsKey, Value: []version.Ref{version.Latest}},
	}, got)

	type A struct {
		A string
	}
	got, err = Meta{
		Version: v1,
		Parents: []version.Version{v2},
		Refs:    []version.Ref{version.Latest},
	}.Apply(A{
		A: "hoge",
	})
	assert.NoError(t, err)
	assert.Equal(t, bson.D{
		{Key: "a", Value: "hoge"},
		{Key: versionKey, Value: v1},
		{Key: parentsKey, Value: []version.Version{v2}},
		{Key: refsKey, Value: []version.Ref{version.Latest}},
	}, got)
}

package mongogit

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func Test_Apply(t *testing.T) {
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

// func TestQuery_Pipeline(t *testing.T) {
// 	v := version.New()
// 	assert.Equal(
// 		t,
// 		[]any{
// 			bson.M{"a": "b"},
// 		},
// 		applyToPipeline(version.All(), []any{bson.M{"a": "b"}}),
// 	)
// 	assert.Equal(
// 		t,
// 		[]any{
// 			bson.M{"a": "b"},
// 			bson.M{
// 				"$match": bson.M{
// 					versionKey: v,
// 				},
// 			},
// 		},
// 		applyToPipeline(version.Eq(v.OrRef()), []any{bson.M{"a": "b"}}),
// 	)
// 	assert.Equal(
// 		t,
// 		[]any{
// 			bson.M{"a": "b"},
// 			bson.M{
// 				"$match": bson.M{
// 					refsKey: bson.M{"$in": []string{"latest"}},
// 				},
// 			},
// 		},
// 		applyToPipeline(version.Eq(version.Latest.OrVersion()), []any{bson.M{"a": "b"}}),
// 	)
// }

func Test_newPipeline(t *testing.T) {
	assert.Equal(t, &pipelineBuilder{
		q:                      nil,
		filter:                 nil,
		metaFilter:             nil,
		pipeline:               nil,
		metaPipeline:           nil,
		metadataCollectionName: "xyz",
	}, newPipeline("xyz"))
}

func Test_pipelineBuilder_Build(t *testing.T) {
	pb := &pipelineBuilder{
		q:                      nil,
		filter:                 nil,
		metaFilter:             nil,
		pipeline:               nil,
		metaPipeline:           nil,
		metadataCollectionName: "xyz",
	}

	assert.Equal(t, []any{
		bson.M{
			"$lookup": bson.M{
				"from":         "xyz",
				"localField":   idKey,
				"foreignField": idKey,
				"as":           metaDocId,
				"pipeline":     []any{bson.M{"$match": bson.M{archivedKey: bson.M{"$ne": true}}}},
			},
		},
		bson.M{"$unwind": bson.M{"path": "$" + metaDocId, "preserveNullAndEmptyArrays": true}},
		bson.M{"$match": bson.M{metaDocId: bson.M{"$ne": nil}}},
	}, pb.Build())

	// with version
	v := version.New()
	pb.q = lo.ToPtr(version.Eq(v.OrRef()))
	assert.Equal(t, []any{
		bson.M{"$match": bson.M{versionKey: v}},
		bson.M{
			"$lookup": bson.M{
				"from":         "xyz",
				"localField":   idKey,
				"foreignField": idKey,
				"as":           metaDocId,
				"pipeline":     []any{bson.M{"$match": bson.M{archivedKey: bson.M{"$ne": true}}}},
			},
		},
		bson.M{"$unwind": bson.M{"path": "$" + metaDocId, "preserveNullAndEmptyArrays": true}},
		bson.M{"$match": bson.M{metaDocId: bson.M{"$ne": nil}}},
	}, pb.Build())

	// with ref
	pb.q = lo.ToPtr(version.Eq(version.Latest.OrVersion()))
	assert.Equal(t, []any{
		bson.M{"$match": bson.M{refsKey: bson.M{"$in": []string{"latest"}}}},
		bson.M{
			"$lookup": bson.M{
				"from":         "xyz",
				"localField":   idKey,
				"foreignField": idKey,
				"as":           metaDocId,
				"pipeline":     []any{bson.M{"$match": bson.M{archivedKey: bson.M{"$ne": true}}}},
			},
		},
		bson.M{"$unwind": bson.M{"path": "$" + metaDocId, "preserveNullAndEmptyArrays": true}},
		bson.M{"$match": bson.M{metaDocId: bson.M{"$ne": nil}}},
	}, pb.Build())

	// with filter
	pb.filter = bson.M{"a": "b"}
	assert.Equal(t, []any{
		bson.M{"$match": bson.M{"a": "b"}},
		bson.M{"$match": bson.M{refsKey: bson.M{"$in": []string{"latest"}}}},
		bson.M{
			"$lookup": bson.M{
				"from":         "xyz",
				"localField":   idKey,
				"foreignField": idKey,
				"as":           metaDocId,
				"pipeline":     []any{bson.M{"$match": bson.M{archivedKey: bson.M{"$ne": true}}}},
			},
		},
		bson.M{"$unwind": bson.M{"path": "$" + metaDocId, "preserveNullAndEmptyArrays": true}},
		bson.M{"$match": bson.M{metaDocId: bson.M{"$ne": nil}}},
	}, pb.Build())

	// with meta filter
	pb.metaFilter = bson.M{"c": "d"}
	assert.Equal(t, []any{
		bson.M{"$match": bson.M{"a": "b"}},
		bson.M{"$match": bson.M{refsKey: bson.M{"$in": []string{"latest"}}}},
		bson.M{
			"$lookup": bson.M{
				"from":         "xyz",
				"localField":   idKey,
				"foreignField": idKey,
				"as":           metaDocId,
				"pipeline": []any{
					bson.M{"$match": bson.M{archivedKey: bson.M{"$ne": true}}},
					bson.M{"$match": bson.M{"c": "d"}},
				},
			},
		},
		bson.M{"$unwind": bson.M{"path": "$" + metaDocId, "preserveNullAndEmptyArrays": true}},
		bson.M{"$match": bson.M{metaDocId: bson.M{"$ne": nil}}},
	}, pb.Build())

	// with pipeline
	pb.pipeline = []any{bson.M{"$match": bson.M{"e": "f"}}}
	assert.Equal(t, []any{
		bson.M{"$match": bson.M{"a": "b"}},
		bson.M{"$match": bson.M{"e": "f"}},
		bson.M{"$match": bson.M{refsKey: bson.M{"$in": []string{"latest"}}}},
		bson.M{
			"$lookup": bson.M{
				"from":         "xyz",
				"localField":   idKey,
				"foreignField": idKey,
				"as":           metaDocId,
				"pipeline": []any{
					bson.M{"$match": bson.M{archivedKey: bson.M{"$ne": true}}},
					bson.M{"$match": bson.M{"c": "d"}},
				},
			},
		},
		bson.M{"$unwind": bson.M{"path": "$" + metaDocId, "preserveNullAndEmptyArrays": true}},
		bson.M{"$match": bson.M{metaDocId: bson.M{"$ne": nil}}},
	}, pb.Build())

	// with meta pipeline
	pb.metaPipeline = []any{bson.M{"$match": bson.M{"g": "h"}}}
	assert.Equal(t, []any{
		bson.M{"$match": bson.M{"a": "b"}},
		bson.M{"$match": bson.M{"e": "f"}},
		bson.M{"$match": bson.M{refsKey: bson.M{"$in": []string{"latest"}}}},
		bson.M{
			"$lookup": bson.M{
				"from":         "xyz",
				"localField":   idKey,
				"foreignField": idKey,
				"as":           metaDocId,
				"pipeline": []any{
					bson.M{"$match": bson.M{archivedKey: bson.M{"$ne": true}}},
					bson.M{"$match": bson.M{"c": "d"}},
					bson.M{"$match": bson.M{"g": "h"}},
				},
			},
		},
		bson.M{"$unwind": bson.M{"path": "$" + metaDocId, "preserveNullAndEmptyArrays": true}},
		bson.M{"$match": bson.M{metaDocId: bson.M{"$ne": nil}}},
	}, pb.Build())
}

func Test_pipelineBuilder_Match(t *testing.T) {
	pb := &pipelineBuilder{
		q:                      nil,
		filter:                 nil,
		metaFilter:             nil,
		pipeline:               nil,
		metaPipeline:           nil,
		metadataCollectionName: "xyz",
	}

	assert.Equal(t, &pipelineBuilder{
		q:                      nil,
		filter:                 bson.M{"a": "b"},
		metaFilter:             nil,
		pipeline:               nil,
		metaPipeline:           nil,
		metadataCollectionName: "xyz",
	}, pb.Match(bson.M{"a": "b"}))
}

func Test_pipelineBuilder_MatchMeta(t *testing.T) {
	pb := &pipelineBuilder{
		q:                      nil,
		filter:                 nil,
		metaFilter:             nil,
		pipeline:               nil,
		metaPipeline:           nil,
		metadataCollectionName: "xyz",
	}

	assert.Equal(t, &pipelineBuilder{
		q:                      nil,
		filter:                 nil,
		metaFilter:             bson.M{"a": "b"},
		pipeline:               nil,
		metaPipeline:           nil,
		metadataCollectionName: "xyz",
	}, pb.MatchMeta(bson.M{"a": "b"}))
}

func Test_pipelineBuilder_MatchMetaPipeline(t *testing.T) {
	pb := &pipelineBuilder{
		q:                      nil,
		filter:                 nil,
		metaFilter:             nil,
		pipeline:               nil,
		metaPipeline:           nil,
		metadataCollectionName: "xyz",
	}

	assert.Equal(t, &pipelineBuilder{
		q:                      nil,
		filter:                 nil,
		metaFilter:             nil,
		pipeline:               nil,
		metaPipeline:           []any{bson.M{"a": "b"}},
		metadataCollectionName: "xyz",
	}, pb.MatchMetaPipeline([]any{bson.M{"a": "b"}}))
}

func Test_pipelineBuilder_MatchPipeline(t *testing.T) {
	pb := &pipelineBuilder{
		q:                      nil,
		filter:                 nil,
		metaFilter:             nil,
		pipeline:               nil,
		metaPipeline:           nil,
		metadataCollectionName: "xyz",
	}

	assert.Equal(t, &pipelineBuilder{
		q:                      nil,
		filter:                 nil,
		metaFilter:             nil,
		pipeline:               []any{bson.M{"a": "b"}},
		metaPipeline:           nil,
		metadataCollectionName: "xyz",
	}, pb.MatchPipeline([]any{bson.M{"a": "b"}}))
}

func Test_pipelineBuilder_MatchVersion(t *testing.T) {
	pb := &pipelineBuilder{
		q:                      nil,
		filter:                 nil,
		metaFilter:             nil,
		pipeline:               nil,
		metaPipeline:           nil,
		metadataCollectionName: "xyz",
	}

	assert.Equal(t, &pipelineBuilder{
		q:                      lo.ToPtr(version.All()),
		filter:                 nil,
		metaFilter:             nil,
		pipeline:               nil,
		metaPipeline:           nil,
		metadataCollectionName: "xyz",
	}, pb.MatchVersion(version.All()))
}

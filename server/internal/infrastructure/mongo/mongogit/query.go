package mongogit

import (
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

func apply(q version.Query, f any) (res any) {
	q.Match(version.QueryMatch{
		All: func() {
			res = f
		},
		Eq: func(vr version.IDOrRef) {
			res = mongox.And(f, "", version.MatchVersionOrRef(
				vr,
				func(v version.ID) bson.M {
					return bson.M{versionKey: v}
				},
				func(r version.Ref) bson.M {
					return bson.M{refsKey: bson.M{"$in": []string{r.String()}}}
				},
			))
		},
	})
	return
}

type pipelineBuilder struct {
	q                      *version.Query
	filter, metaFilter     any
	pipeline, metaPipeline []any
	metadataCollectionName string
}

func newPipeline(metadataCollectionName string) *pipelineBuilder {
	return &pipelineBuilder{
		metadataCollectionName: metadataCollectionName,
	}
}

func (b *pipelineBuilder) Match(filter any) *pipelineBuilder {
	if filter != nil {
		b.filter = filter
	}
	return b
}

func (b *pipelineBuilder) MatchPipeline(pipeline []any) *pipelineBuilder {
	if pipeline != nil {
		b.pipeline = pipeline
	}
	return b
}

func (b *pipelineBuilder) apply(pipeline []any) (res []any) {
	res = pipeline
	if b.filter != nil {
		res = append(res, bson.M{"$match": b.filter})
	}
	if b.pipeline != nil {
		res = append(res, b.pipeline...)
	}
	return
}

func (b *pipelineBuilder) MatchMeta(filter any) *pipelineBuilder {
	if filter != nil {
		b.metaFilter = filter
	}
	return b
}

func (b *pipelineBuilder) MatchMetaPipeline(pipeline []any) *pipelineBuilder {
	if pipeline != nil {
		b.metaPipeline = pipeline
	}
	return b
}

func (b *pipelineBuilder) applyMeta(pipeline []any) (res []any) {
	p := []any{
		bson.M{"$match": bson.M{archivedKey: bson.M{"$ne": true}}},
	}

	if b.metaFilter != nil {
		p = append(p, bson.M{"$match": b.metaFilter})
	}

	if b.metaPipeline != nil {
		p = append(p, b.metaPipeline...)
	}

	// lookup the meta item
	res = append(
		pipeline,
		bson.M{
			"$lookup": bson.M{
				"from":         b.metadataCollectionName,
				"localField":   idKey,
				"foreignField": idKey,
				"as":           metaDocId,
				"pipeline":     p,
			},
		},
	)
	// unwind the meta item
	res = append(res, bson.M{"$unwind": bson.M{"path": "$" + metaDocId, "preserveNullAndEmptyArrays": true}})

	// filter out item which has no meta
	res = append(res, bson.M{"$match": bson.M{metaDocId: bson.M{"$ne": nil}}})

	return
}

func (b *pipelineBuilder) MatchVersion(q version.Query) *pipelineBuilder {
	b.q = &q
	return b
}

func (b *pipelineBuilder) applyVersion(pipeline []any) (res []any) {
	if b.q == nil {
		return pipeline
	}
	b.q.Match(version.QueryMatch{
		All: func() {
			res = pipeline
		},
		Eq: func(vr version.IDOrRef) {
			b := bson.M{}

			vr.Match(
				func(v version.ID) {
					b[versionKey] = v
				},
				func(r version.Ref) {
					b[refsKey] = bson.M{"$in": []string{r.String()}}
				},
			)

			res = append(
				pipeline,
				bson.M{
					"$match": b,
				},
			)
		},
	})
	return
}

func (b *pipelineBuilder) Build() []any {
	var p []any
	p = b.apply(p)
	p = b.applyVersion(p)
	p = b.applyMeta(p)
	return p
}

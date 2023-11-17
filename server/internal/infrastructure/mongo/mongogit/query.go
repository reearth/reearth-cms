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
		Eq: func(vr version.VersionOrRef) {
			res = mongox.And(f, "", version.MatchVersionOrRef(
				vr,
				func(v version.Version) bson.M {
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

func applyToPipeline(q version.Query, pipeline []any, metadataCollectionName string) (res []any) {
	q.Match(version.QueryMatch{
		All: func() {
			res = pipeline
		},
		Eq: func(vr version.VersionOrRef) {
			b := bson.M{}

			vr.Match(
				func(v version.Version) {
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

func applyMetaToPipeline(query any, pipeline []any, metadataCollectionName string) (res []any) {
	p := []bson.M{
		{"$match": bson.M{archivedKey: bson.M{"$ne": true}}},
	}

	if query != nil {
		p = append(p, bson.M{"$match": query})
	}

	// lookup the meta item
	res = append(
		pipeline,
		bson.M{
			"$lookup": bson.M{
				"from":         metadataCollectionName,
				"localField":   "__id",
				"foreignField": "__id",
				"as":           "__",
				"pipeline":     p,
			},
		},
	)
	// unwind the meta item
	res = append(res, bson.M{"$unwind": bson.M{"path": "$__", "preserveNullAndEmptyArrays": true}})

	// filter out item which has no meta
	res = append(res, bson.M{"$match": bson.M{"__": bson.M{"$ne": nil}}})

	return
}

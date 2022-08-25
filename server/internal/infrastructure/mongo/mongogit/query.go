package mongogit

import (
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

type Query struct {
	all bool
	eq  *version.VersionOrRef
}

func All() Query {
	return Query{all: true}
}

func Eq(vr version.VersionOrRef) Query {
	return Query{eq: lo.ToPtr(vr)}
}

type QueryMatch struct {
	All func()
	Eq  func(version.VersionOrRef)
}

func (q Query) Match(m QueryMatch) {
	if q.all && m.All != nil {
		m.All()
		return
	}
	if q.eq != nil && m.Eq != nil {
		m.Eq(*q.eq)
		return
	}
}

func (q Query) apply(f any) (res any) {
	f = excludeMetadata(f)
	q.Match(QueryMatch{
		All: func() {
			res = f
		},
		Eq: func(vr version.VersionOrRef) {
			res = mongodoc.And(f, "", version.MatchVersionOrRef(
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

func excludeMetadata(f any) any {
	return mongodoc.And(f, metaKey, bson.M{"$exists": false})
}

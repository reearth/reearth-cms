package mongogit

import (
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

type Query = *version.VersionOrRef

func applyQuery(q Query, f any) any {
	return eqVersion(q, f)
}

func eqVersion(vr *version.VersionOrRef, f any) any {
	e := version.MatchVersionOrRef(
		lo.FromPtrOr(vr, version.Latest.OrVersion()),
		func(v version.Version) bson.M {
			return bson.M{versionKey: v}
		},
		func(r version.Ref) bson.M {
			return bson.M{refsKey: bson.M{"$in": []string{r.String()}}}
		},
	)
	return mongodoc.And(f, "", e)
}

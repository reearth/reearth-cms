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
		func(v version.Version) bson.E {
			return bson.E{Key: versionKey, Value: v}
		},
		func(r version.Ref) bson.E {
			return bson.E{Key: refsKey, Value: bson.M{"$in": []string{r.String()}}}
		},
	)
	return mongodoc.AppendE(f, e)
}

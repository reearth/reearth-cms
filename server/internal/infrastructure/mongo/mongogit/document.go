package mongogit

import (
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"go.mongodb.org/mongo-driver/bson"
)

const (
	versionKey = "__v"
	parentsKey = "__w"
	refsKey    = "__r"
	metaKey    = "__"
)

type Meta struct {
	Version version.Version   `json:"__v" bson:"__v"`
	Parents []version.Version `json:"__w" bson:"__w"`
	Refs    []version.Ref     `json:"__r" bson:"__r"`
}

func (meta Meta) Apply(d any) (any, error) {
	b, err := bson.Marshal(d)
	if err != nil {
		return nil, err
	}

	m := bson.D{}
	if err := bson.Unmarshal(b, &m); err != nil {
		return nil, err
	}

	return mongodoc.AppendE(
		m,
		bson.E{Key: versionKey, Value: meta.Version},
		bson.E{Key: parentsKey, Value: meta.Parents},
		bson.E{Key: refsKey, Value: meta.Refs},
	), nil
}

func metaFromRaw(r bson.Raw) Meta {
	m := Meta{}
	_ = bson.Unmarshal(r, &m)
	return m
}

type Metadata struct {
	ID       string
	Meta     bool `json:"__" bson:"__"`
	Archived bool
}

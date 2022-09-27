package mongogit

import (
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

const (
	versionKey = "__v"
	parentsKey = "__w"
	refsKey    = "__r"
	metaKey    = "__"
)

type Document[T any] struct {
	Data T
	Meta Meta
}

func NewDocument[T any](v *version.Value[T]) *Document[T] {
	if v == nil {
		return nil
	}
	return &Document[T]{
		Data: v.Value(),
		Meta: Meta{
			Version: v.Version(),
			Parents: v.Parents().Values(),
			Refs:    v.Refs().Values(),
		},
	}
}

func (d *Document[T]) Value() *version.Value[T] {
	if d == nil {
		return nil
	}
	return version.NewValue(
		d.Meta.Version,
		version.NewVersions(d.Meta.Parents...),
		version.NewRefs(d.Meta.Refs...),
		d.Data,
	)
}

func (d *Document[T]) MarshalBSON() ([]byte, error) {
	val, err := d.Meta.apply(d.Data)
	if err != nil {
		return nil, err
	}
	return bson.Marshal(val)
}

func (d *Document[T]) UnmarshalBSON(b []byte) error {
	if d == nil {
		*d = Document[T]{}
	}
	if err := bson.Unmarshal(b, &d.Meta); err != nil {
		return err
	}
	if err := bson.Unmarshal(b, &d.Data); err != nil {
		return err
	}
	return nil
}

type Meta struct {
	Version version.Version   `json:"__v" bson:"__v"`
	Parents []version.Version `json:"__w" bson:"__w"`
	Refs    []version.Ref     `json:"__r" bson:"__r"`
}

func ToValue[T any](m Meta, inner T) *version.Value[T] {
	return version.NewValue(
		m.Version,
		version.NewVersions(m.Parents...),
		version.NewRefs(m.Refs...),
		inner,
	)
}

func (meta Meta) apply(d any) (any, error) {
	b, err := bson.Marshal(d)
	if err != nil {
		return nil, err
	}

	m := bson.D{}
	if err := bson.Unmarshal(b, &m); err != nil {
		return nil, err
	}

	return mongox.AppendE(
		m,
		bson.E{Key: versionKey, Value: meta.Version},
		bson.E{Key: parentsKey, Value: meta.Parents},
		bson.E{Key: refsKey, Value: meta.Refs},
	), nil
}

type MetadataDocument struct {
	ID       string
	Meta     bool `json:"__" bson:"__"`
	Archived bool
}

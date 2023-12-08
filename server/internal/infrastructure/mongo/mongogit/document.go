package mongogit

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	objectIDKey = "_id"
	idKey       = "__id"
	versionKey  = "__v"
	parentsKey  = "__w"
	refsKey     = "__r"
)

type Identifiable interface {
	IDString() string
}

type Document[T Identifiable] struct {
	ObjectID primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	ID       string             `json:"__id,omitempty" bson:"__id,omitempty"`
	Version  version.ID         `json:"__v,omitempty" bson:"__v,omitempty"`
	Parents  []version.ID       `json:"__w,omitempty" bson:"__w,omitempty"`
	Refs     []version.Ref      `json:"__r,omitempty" bson:"__r,omitempty"`
	Data     T                  `json:",inline" bson:",inline"`
}

func NewDocument[T, M Identifiable](v *version.Version[T, M]) *Document[T] {
	if v == nil || v.Value() == nil {
		return nil
	}
	return &Document[T]{
		ObjectID: primitive.NewObjectIDFromTimestamp(util.Now()),
		ID:       (*v.Value()).IDString(),
		Version:  v.Version(),
		Parents:  v.Parents().Values(),
		Refs:     v.Refs().Values(),
		Data:     *v.Value(),
	}
}

func (d *Document[T]) Value() *version.Version[T, any] {
	if d == nil {
		return nil
	}
	return version.New[T, any](
		d.Version,
		version.NewIDs(d.Parents...),
		version.NewRefs(d.Refs...),
		d.ObjectID.Timestamp(),
		&d.Data,
		nil,
	)
}

func (d *Document[T]) Timestamp() time.Time {
	return d.ObjectID.Timestamp()
}

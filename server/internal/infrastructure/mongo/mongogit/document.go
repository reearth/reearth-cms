package mongogit

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	idKey       = "id"
	objectIDKey = "_id"
	versionKey  = "__v"
	parentsKey  = "__w"
	refsKey     = "__r"
	metaKey     = "__"
)

// type Document[T any] struct {
// 	Data T
// 	Meta Meta
// }
//
// func NewDocument[T any](v *version.Value[T]) *Document[T] {
// 	if v == nil {
// 		return nil
// 	}
// 	return &Document[T]{
// 		Data: v.Value(),
// 		Meta: Meta{
// 			ObjectID: primitive.NewObjectIDFromTimestamp(util.Now()),
// 			Version:  v.Version(),
// 			Parents:  v.Parents().Values(),
// 			Refs:     v.Refs().Values(),
// 		},
// 	}
// }
//
// func (d *Document[T]) Value() *version.Value[T] {
// 	if d == nil {
// 		return nil
// 	}
// 	return version.NewValue(
// 		d.Meta.Version,
// 		version.NewVersions(d.Meta.Parents...),
// 		version.NewRefs(d.Meta.Refs...),
// 		d.Meta.Timestamp(),
// 		d.Data,
// 	)
// }
//
// func (d *Document[T]) MarshalBSON() ([]byte, error) {
// 	val, err := d.Meta.apply(d.Data)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return bson.Marshal(val)
// }
//
// func (d *Document[T]) UnmarshalBSON(b []byte) error {
// 	if d == nil {
// 		*d = Document[T]{}
// 	}
// 	if err := bson.Unmarshal(b, &d.Meta); err != nil {
// 		return err
// 	}
// 	if err := bson.Unmarshal(b, &d.Data); err != nil {
// 		return err
// 	}
// 	return nil
// }

//	type Meta struct {
//		// ID       string             `json:"id,omitempty" bson:"id,omitempty"`
//		ObjectID primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
//		Version  version.Version    `json:"__v,omitempty" bson:"__v,omitempty"`
//		Parents  []version.Version  `json:"__w,omitempty" bson:"__w,omitempty"`
//		Refs     []version.Ref      `json:"__r,omitempty" bson:"__r,omitempty"`
//	}
//
//	func (m Meta) Timestamp() time.Time {
//		return m.ObjectID.Timestamp()
//	}
//
//	func (m Meta) apply(d any) (any, error) {
//		b, err := bson.Marshal(d)
//		if err != nil {
//			return nil, err
//		}
//
//		var doc any = bson.D{}
//		if err := bson.Unmarshal(b, &doc); err != nil {
//			return nil, err
//		}
//
//		if !m.ObjectID.IsZero() {
//			doc = mongox.AppendE(doc, bson.E{Key: objectIDKey, Value: m.ObjectID})
//		}
//
//		return mongox.AppendE(
//			doc,
//			bson.E{Key: versionKey, Value: m.Version},
//			bson.E{Key: parentsKey, Value: m.Parents},
//			bson.E{Key: refsKey, Value: m.Refs},
//		), nil
//	}
// func ToValue[T any](m Document[any], inner T) *version.Value[T] {
// 	var parents version.Versions
// 	var refs version.Refs
// 	if len(m.Parents) > 0 {
// 		parents = version.NewVersions(m.Parents...)
// 	}
// 	if len(m.Refs) > 0 {
// 		refs = version.NewRefs(m.Refs...)
// 	}
//
// 	return version.NewValue(
// 		m.Version,
// 		parents,
// 		refs,
// 		m.Timestamp(),
// 		inner,
// 	)
// }

// ======================================

type Document[T any] struct {
	// ID       string             `json:"id,omitempty" bson:"id,omitempty"`
	ObjectID primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Version  version.Version    `json:"__v,omitempty" bson:"__v,omitempty"`
	Parents  []version.Version  `json:"__w,omitempty" bson:"__w,omitempty"`
	Refs     []version.Ref      `json:"__r,omitempty" bson:"__r,omitempty"`
	Data     T                  `json:"inline" bson:"inline"`
}

func NewDocument[T any](v *version.Value[T]) *Document[T] {
	if v == nil {
		return nil
	}
	return &Document[T]{
		ObjectID: primitive.NewObjectIDFromTimestamp(util.Now()),
		Version:  v.Version(),
		Parents:  v.Parents().Values(),
		Refs:     v.Refs().Values(),
		Data:     v.Value(),
	}
}

func (d *Document[T]) Value() *version.Value[T] {
	if d == nil {
		return nil
	}
	return version.NewValue(
		d.Version,
		version.NewVersions(d.Parents...),
		version.NewRefs(d.Refs...),
		d.ObjectID.Timestamp(),
		d.Data,
	)
}

func (d *Document[T]) Timestamp() time.Time {
	return d.ObjectID.Timestamp()
}

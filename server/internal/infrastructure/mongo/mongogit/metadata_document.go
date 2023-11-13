package mongogit

import (
	"time"
)

const (
	archivedKey  = "__a"
	createdAtKey = "__c"
	updatedUtKey = "__u"
)

type MetadataDocument[T any] struct {
	ID        string     `bson:"id,omitempty"`
	Archived  bool       `bson:"__a,omitempty"`
	CreatedAt time.Time  `bson:"__c,omitempty"`
	UpdatedAt *time.Time `bson:"__u,omitempty"`
	Metadata  T          `bson:"inline"`
}

// func (d *MetadataDocument[T]) MarshalBSON() ([]byte, error) {
// 	val, err := d.flatten()
// 	if err != nil {
// 		return nil, err
// 	}
// 	return bson.Marshal(val)
// }
//
// func (d *MetadataDocument[T]) UnmarshalBSON(b []byte) error {
// 	if d == nil {
// 		*d = MetadataDocument[T]{}
// 	}
// 	if err := bson.Unmarshal(b, &d); err != nil {
// 		return err
// 	}
// 	if err := bson.Unmarshal(b, &d.Metadata); err != nil {
// 		return err
// 	}
// 	return nil
// }
//
// func (d *MetadataDocument[T]) flatten() (any, error) {
// 	b, err := bson.Marshal(d.Metadata)
// 	if err != nil {
// 		return nil, err
// 	}
//
// 	var doc any = bson.D{}
// 	if err := bson.Unmarshal(b, &doc); err != nil {
// 		return nil, err
// 	}
//
// 	return mongox.AppendE(
// 		doc,
// 		bson.E{Key: idKey, Value: d.ID},
// 		bson.E{Key: archivedKey, Value: d.Archived},
// 		bson.E{Key: createdAtKey, Value: d.CreatedAt},
// 		bson.E{Key: updatedUtKey, Value: d.UpdatedAt},
// 	), nil
// }

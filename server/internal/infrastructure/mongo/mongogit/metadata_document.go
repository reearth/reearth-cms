package mongogit

import (
	"time"
)

const (
	metaDocId    = "__"
	archivedKey  = "__a"
	createdAtKey = "__c"
	updatedUtKey = "__u"
)

type MetadataDocument[T Identifiable] struct {
	ID        string     `bson:"__id,omitempty"`
	Archived  bool       `bson:"__a,omitempty"`
	CreatedAt time.Time  `bson:"__c,omitempty"`
	UpdatedAt *time.Time `bson:"__u,omitempty"`
	Metadata  T          `bson:",inline"`
}

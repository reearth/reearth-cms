package mongogit

const (
	metaDocId   = "__"
	archivedKey = "__a"
)

type MetadataDocument[T Identifiable] struct {
	ID       string `bson:"__id"`
	Archived bool   `bson:"__a"`
	Metadata T      `bson:",inline"`
}

// Package task holds the copy task changes that the server sends to the
// worker's copier as JSON.
//
// The server and the worker are deployed separately, so a new server can talk
// to an older worker for a while. Keep changes to this JSON backward
// compatible: add new change types or fields, but do not rename or remove
// existing ones.
package task

// Changes maps a document field to the change the copier applies to it.
type Changes map[string]Change

type Change struct {
	Type  ChangeType
	Value any
}

type ChangeType string

const (
	// ChangeTypeSet replaces the field with Value.
	ChangeTypeSet ChangeType = "set"
	// ChangeTypeNew replaces the field with a new ID. Value names the kind of
	// ID: "item", "schema", "model" or "version".
	ChangeTypeNew ChangeType = "new"
	// ChangeTypeULID keeps the field's ULID and sets its time to Value
	// (Unix milliseconds).
	ChangeTypeULID ChangeType = "ulid"
)

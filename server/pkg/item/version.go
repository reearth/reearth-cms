package item

import "github.com/reearth/reearth-cms/server/pkg/schema"

type Version struct {
	version string
	parent  []string
	ref     []string
	fields  []FieldID
}

func (v *Version) Version() string {
	return v.version
}

func (v *Version) Parent() []string {
	return v.parent
}

func (v *Version) Ref() []string {
	return v.ref
}

func (v *Version) Fields() schema.Field {
	return v.fields
}

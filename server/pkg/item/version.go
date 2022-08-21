package item

import "github.com/reearth/reearth-cms/server/pkg/id"

type Version struct {
	version string
	parent  []string
	ref     []string
	fields  id.FieldIDList
}

func NewVersion(version *string, parent, ref []string, fields id.FieldIDList) *Version {
	if version == nil {
		return nil
	}
	return &Version{
		version: *version,
		parent:  parent,
		ref:     ref,
		fields:  fields,
	}
}

func (v *Version) AddRef(ref *string) {
	if ref == nil {
		return
	}
	v.ref = append(v.ref, *ref)
}

func (v *Version) AddParent(parent *string) {
	if parent == nil {
		return
	}
	v.parent = append(v.parent, *parent)
}

func (v *Version) AddField(field id.FieldID) {
	v.fields = v.fields.Add(field)
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

func (v *Version) Fields() id.FieldIDList {
	return v.fields
}

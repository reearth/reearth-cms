package item

type Version struct {
	version string
	parent  []string
	ref     []string
	fields  []FieldID
}

func NewVersion(version *string, parent, ref []string, fields []FieldID) *Version {
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

func (v *Version) AddField(field FieldID) {
	v.fields = append(v.fields, field)
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

func (v *Version) Fields() []FieldID {
	return v.fields
}

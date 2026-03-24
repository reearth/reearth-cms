package job

import "strings"

type Type string

const (
	TypeImport Type = "import"
	// Future types can be added here:
	// TypeExport     Type = "export"
	// TypeBulkUpdate Type = "bulk_update"
)

func TypeFrom(s string) (Type, bool) {
	ss := strings.ToLower(s)
	switch Type(ss) {
	case TypeImport:
		return TypeImport, true
	default:
		return Type(""), false
	}
}

func TypeFromRef(s *string) *Type {
	if s == nil {
		return nil
	}
	t, ok := TypeFrom(*s)
	if !ok {
		return nil
	}
	return &t
}

func (t Type) String() string {
	return string(t)
}

func (t *Type) StringRef() *string {
	if t == nil {
		return nil
	}
	t2 := string(*t)
	return &t2
}

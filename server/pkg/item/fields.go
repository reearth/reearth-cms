package item

import "github.com/samber/lo"

type Fields []*Field

type FieldMap map[FieldID]*Field

func (f Fields) Map() FieldMap {
	m := make(map[FieldID]*Field)
	for _, field := range f {
		if field != nil {
			m[field.FieldID()] = field
		}
	}
	return m
}

func (f Fields) Field(fID FieldID) *Field {
	ff, _ := lo.Find(f, func(g *Field) bool {
		return g.FieldID() == fID
	})
	return ff
}

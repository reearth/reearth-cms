package value

var defaultTypes = typeRegistry{
	TypeAsset:          &propertyAsset{},
	TypeBool:           &propertyBool{},
	TypeCheckbox:       &propertyBool{},
	TypeDateTime:       &propertyDateTime{},
	TypeInteger:        &propertyInteger{},
	TypeNumber:         &propertyNumber{},
	TypeText:           &propertyString{},
	TypeTextArea:       &propertyString{},
	TypeRichText:       &propertyString{},
	TypeMarkdown:       &propertyString{},
	TypeSelect:         &propertyString{},
	TypeTag:            &propertyString{},
	TypeGroup:          &propertyGroup{},
	TypeReference:      &propertyReference{},
	TypeURL:            &propertyURL{},
	TypeGeometryObject: &propertyJson{},
	TypeGeometryEditor: &propertyJson{},
}

type typeRegistry map[Type]TypeProperty

func (r typeRegistry) Get(t Type) TypeProperty {
	return r[t]
}

func (r typeRegistry) ToValue(t Type, v any) (any, bool) {
	tp := r.Get(t)
	if tp == nil {
		return nil, false
	}
	return tp.ToValue(v)
}

func (r typeRegistry) ToInterface(t Type, v any) (any, bool) {
	tp := r.Get(t)
	if tp == nil {
		return nil, false
	}
	return tp.ToInterface(v)
}

func (r typeRegistry) Validate(t Type, v any) (bool, bool) {
	tp := r.Get(t)
	if tp == nil {
		return false, false
	}
	return tp.Validate(v), true
}

type TypeProperty interface {
	ToValue(any) (any, bool)
	ToInterface(any) (any, bool)
	Validate(any) bool
	IsEmpty(any) bool
	Equal(any, any) bool
}

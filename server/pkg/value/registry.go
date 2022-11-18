package value

var defaultTypes = &TypeRegistry{
	Registry: map[Type]TypeProperty{
		TypeAsset:     &propertyAsset{},
		TypeBool:      &propertyBool{},
		TypeDateTime:  &propertyDateTime{},
		TypeInteger:   &propertyInteger{},
		TypeNumber:    &propertyNumber{},
		TypeString:    &propertyString{},
		TypeText:      &propertyString{},
		TypeTextArea:  &propertyString{},
		TypeRichText:  &propertyString{},
		TypeMarkdown:  &propertyString{},
		TypeSelect:    &propertyString{},
		TypeReference: &propertyReference{},
		TypeURL:       &propertyURL{},
	},
}

type TypeRegistry struct {
	Registry map[Type]TypeProperty
}

func (r *TypeRegistry) Find(t Type) (tp TypeProperty) {
	if r != nil && r.Registry != nil {
		tp = r.Registry[t]
	}
	if tp == nil && r != defaultTypes {
		tp = defaultTypes.Get(t)
	}
	return tp
}

func (r *TypeRegistry) Get(t Type) TypeProperty {
	return r.Registry[t]
}

func (r *TypeRegistry) ToValue(t Type, v any) (any, bool) {
	tp := r.Find(t)
	if tp == nil {
		return nil, false
	}
	return tp.ToValue(v)
}

func (r *TypeRegistry) ToInterface(t Type, v any) (any, bool) {
	tp := r.Find(t)
	if tp == nil {
		return nil, false
	}
	return tp.ToInterface(v)
}

func (r *TypeRegistry) Validate(t Type, v any) (bool, bool) {
	tp := r.Find(t)
	if tp == nil {
		return false, false
	}
	return tp.Validate(v), true
}

type TypeProperty interface {
	ToValue(any) (any, bool)
	ToInterface(any) (any, bool)
	Validate(any) bool
}

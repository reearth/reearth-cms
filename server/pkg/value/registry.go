package value

var defaultTypes = &TypeRegistry{
	Registry: map[Type]TypeProperty{
		TypeBool:     &propertyBool{},
		TypeNumber:   &propertyNumber{},
		TypeString:   &propertyString{},
		TypeDateTime: &propertyDateTime{},
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

func (r *TypeRegistry) I2V(t Type, v any) (any, bool) {
	tp := r.Find(t)
	if tp == nil {
		return nil, false
	}
	return tp.I2V(v)
}

func (r *TypeRegistry) V2I(t Type, v any) (any, bool) {
	tp := r.Find(t)
	if tp == nil {
		return nil, false
	}
	return tp.V2I(v)
}

func (r *TypeRegistry) Validate(t Type, v any) (bool, bool) {
	tp := r.Find(t)
	if tp == nil {
		return false, false
	}
	return tp.Validate(v), true
}

type TypeProperty interface {
	I2V(any) (any, bool)
	V2I(any) (any, bool)
	Validate(any) bool
}

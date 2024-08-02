package value

import (
	"strconv"
	"time"
)

type Value struct {
	t Type
	v any
	p TypeRegistry
}

func New(t Type, v any) *Value {
	return NewWithTypeRegistry(t, v, nil)
}

func NewWithTypeRegistry(t Type, v any, p TypeRegistry) *Value {
	return t.ValueFrom(v, p)
}

func (v *Value) IsEmpty() bool {
	if v == nil || v.t == TypeUnknown || v.v == nil {
		return true
	}
	tp := v.TypeProperty()
	return tp == nil || tp.IsEmpty(v.v)
}

func (v *Value) Clone() *Value {
	if v == nil {
		return nil
	}
	return v.t.ValueFrom(v.v, v.p)
}

func (v *Value) Some() *Optional {
	return OptionalFrom(v)
}

func (v *Value) AsMultiple() *Multiple {
	if v == nil {
		return nil
	}
	return MultipleFrom(v.t, []*Value{v})
}

func (v *Value) Value() interface{} {
	if v == nil {
		return nil
	}
	return v.v
}

func (v *Value) Type() Type {
	if v == nil {
		return TypeUnknown
	}
	return v.t
}

func (v *Value) TypeProperty() (tp TypeProperty) {
	if v == nil {
		return
	}
	if tp := v.p.Find(v.t); tp != nil {
		return tp
	}
	return
}

// Interface converts the value into generic representation
func (v *Value) Interface() any {
	if v.IsEmpty() {
		return nil
	}

	if i, ok := v.p.ToInterface(v.t, v.v); ok {
		return i
	}
	return nil
}

func (v *Value) Validate() bool {
	if v.IsEmpty() {
		return false
	}

	valid, _ := v.p.Validate(v.t, v.v)
	return valid
}

func (v *Value) Equal(w *Value) bool {
	if v == nil || w == nil || v.t != w.t {
		return false
	}
	return v.p.Find(v.t).Equal(v.v, w.v)
}

func (v *Value) Cast(t Type) *Value {
	if v == nil {
		return nil
	}
	if v.t == t {
		return v.Clone()
	}
	return t.ValueFrom(v.v, v.p)
}

func (vv *Value) ToCSVValue() string {
	if vv == nil {
		return ""
	}

	switch vv.Type() {
	case TypeText, TypeTextArea, TypeRichText, TypeMarkdown, TypeSelect, TypeTag:
		v, ok := vv.ValueString()
		if !ok {
			return ""
		}
		return v
	case TypeURL:
		v, ok := vv.ValueURL()
		if !ok {
			return ""
		}
		return v.String()
	case TypeAsset:
		v, ok := vv.ValueAsset()
		if !ok {
			return ""
		}
		return v.String()
	case TypeInteger:
		v, ok := vv.ValueInteger()
		if !ok {
			return ""
		}
		return strconv.FormatInt(v, 10)
	case TypeNumber:
		v, ok := vv.ValueNumber()
		if !ok {
			return ""
		}
		return strconv.FormatFloat(v, 'f', -1, 64)
	case TypeBool, TypeCheckbox:
		v, ok := vv.ValueBool()
		if !ok {
			return ""
		}
		return strconv.FormatBool(v)
	case TypeDateTime:
		v, ok := vv.ValueDateTime()
		if !ok {
			return ""
		}
		return v.Format(time.RFC3339)
	default:
		return ""
	}
}

func (vv *Value) ToGeoJsonSingleValue() (any, bool) {
	if vv == nil {
		return "", false
	}

	switch vv.Type() {
	case TypeText, TypeTextArea, TypeRichText, TypeMarkdown, TypeSelect, TypeTag:
		v, ok := vv.ValueString()
		if !ok {
			return "", false
		}
		return v, true
	case TypeURL:
		v, ok := vv.ValueURL()
		if !ok {
			return "", false
		}
		return v.String(), true
	case TypeAsset:
		v, ok := vv.ValueAsset()
		if !ok {
			return "", false
		}
		return v.String(), true
	case TypeInteger:
		v, ok := vv.ValueInteger()
		if !ok {
			return "", false
		}
		return v, true
	case TypeNumber:
		v, ok := vv.ValueNumber()
		if !ok {
			return "", false
		}
		return v, true
	case TypeBool, TypeCheckbox:
		v, ok := vv.ValueBool()
		if !ok {
			return "", false
		}
		return v, true
	case TypeDateTime:
		v, ok := vv.ValueDateTime()
		if !ok {
			return "", false
		}
		return v.Format(time.RFC3339), true
	default:
		return "", false
	}
}

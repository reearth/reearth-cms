package value

type tpmock struct {
	TypeProperty
}

func (*tpmock) ToValue(i any) (any, bool) {
	return i.(string) + "a", true
}

func (*tpmock) ToInterface(v any) (any, bool) {
	return v.(string) + "bar", true
}

func (*tpmock) Validate(v any) bool {
	_, ok := v.(string)
	return ok
}

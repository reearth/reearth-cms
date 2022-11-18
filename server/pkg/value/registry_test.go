package value

type tpmock struct {
	TypeProperty
}

func (*tpmock) I2V(i any) (any, bool) {
	return i.(string) + "a", true
}

func (*tpmock) V2I(v any) (any, bool) {
	return v.(string) + "bar", true
}

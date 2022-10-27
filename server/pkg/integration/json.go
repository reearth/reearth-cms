package integration

import "errors"

type JSONMarshaler interface {
	MarshalIntegrationJSON(version string) ([]byte, error)
}

var ErrFailedToMarshal = errors.New("failed to marshal")

func MarshalJSON(o any, v string) ([]byte, error) {
	if m, ok := o.(JSONMarshaler); ok {
		return m.MarshalIntegrationJSON(v)
	}
	return nil, ErrFailedToMarshal
}

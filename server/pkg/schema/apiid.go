package schema

import "errors"

type ApiID string

var ErrInvalidForm error = errors.New("invalid api ID form")

func NewAPIID(id string) (ApiID, error) {
	if ok := isUrlValid(id); !ok {
		return "", ErrInvalidForm
	}

	return ApiID(id), nil
}

func isUrlValid(val string) bool {
	if val == "" {
		return false
	}
	//TODO: impl to check if val is URL safe char?
	return true
}

package schema

type apiID string

func NewAPIID(id string) (apiID, error) {
	if id == "" {
		return "", nil
	}
	// TODO: check if id is unique under the model
	return apiID(id), nil
}

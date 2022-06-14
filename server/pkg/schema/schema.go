package schema

import "github.com/reearth/reearth-cms/server/pkg/project"

type Schema struct {
	id        string
	projectId project.ID //TODO: change here
	name      string
	fields    []*Field
	//The reason why it has actual ( not ids of field ) is
	// we assume user will save schema itself, not each field individually.
	//TODO: Add more neccesary fields
}

func NewScheme() *Schema {
	// TODO: impl recieve params
	return &Schema{}
}

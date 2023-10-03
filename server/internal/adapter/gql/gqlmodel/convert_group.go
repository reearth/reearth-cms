package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/group"
)

func ToGroup(m *group.Group) *Group {
	if m == nil {
		return nil
	}

	return &Group{
		ID:          IDFrom(m.ID()),
		ProjectID:   IDFrom(m.Project()),
		SchemaID:    IDFrom(m.Schema()),
		Name:        m.Name(),
		Description: m.Description(),
		Key:         m.Key().String(),
	}
}

package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type Schema struct {
	id        ID
	workspace id.WorkspaceID
}

func (s *Schema) ID() ID {
	return s.id
}

func (s *Schema) SetID(id ID) {
	s.id = id
}

func (s *Schema) Workspace() id.WorkspaceID {
	return s.workspace
}

func (s *Schema) SetWorkspace(workspace id.WorkspaceID) {
	s.workspace = workspace
}

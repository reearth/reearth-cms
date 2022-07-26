package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type Schema struct {
	id        ID
	workspace id.WorkspaceID
	fields    []*Field
}

func (s *Schema) ID() ID {
	return s.id
}

func (s *Schema) Workspace() id.WorkspaceID {
	return s.workspace
}

func (s *Schema) SetWorkspace(workspace id.WorkspaceID) {
	s.workspace = workspace
}

func (s *Schema) AddField(f Field) {
	if s.fields == nil {
		s.fields = []*Field{}
	}
	for _, sf := range s.fields {
		if sf.id.Equal(f.ID()) {
			return
		}
	}
	s.fields = append(s.fields, &f)
}

func (s *Schema) Field(fId FieldID) *Field {
	if s == nil || s.fields == nil {
		return nil
	}
	for _, f := range s.fields {
		if f.id.Equal(fId) {
			return f
		}
	}
	return nil
}

func (s *Schema) Fields() []*Field {
	if s == nil {
		return nil
	}
	return s.fields
}

func (s *Schema) RemoveField(fid FieldID) {
	if s == nil {
		return
	}

	for i, field := range s.fields {
		if field.id.Equal(fid) {
			s.fields = append(s.fields[:i], s.fields[i+1:]...)
			return
		}
	}
}

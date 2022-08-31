package thread

import "golang.org/x/exp/slices"

type Thread struct {
	id        ID
	workspace WorkspaceID
	comments  []*Comment
}

func (th *Thread) ID() ID {
	return th.id
}

func (th *Thread) Workspace() WorkspaceID {
	return th.workspace
}

func (th *Thread) Comments() []*Comment {
	if th == nil {
		return nil
	}
	return slices.Clone(th.comments)
}

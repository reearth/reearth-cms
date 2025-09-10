package workspace

type Workspace struct {
	id       ID
	name     string
	alias    string
	metadata Metadata
	personal bool
}

type WorkspaceList []Workspace

func (w *Workspace) ID() ID {
	return w.id
}

func (w *Workspace) Name() string {
	return w.name
}

func (w *Workspace) Alias() string {
	return w.alias
}

func (w *Workspace) Metadata() Metadata {
	return w.metadata
}

func (w *Workspace) Personal() bool {
	return w.personal
}

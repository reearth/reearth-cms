package item

import "github.com/reearth/reearth-cms/server/pkg/id"

type Query struct {
	workspace id.WorkspaceID
	project   id.ProjectID
	q         string
}

func NewQuery(workspace id.WorkspaceID, project id.ProjectID, q string) *Query {
	return &Query{
		workspace: workspace,
		project:   project,
		q:         q,
	}
}

// Q returns keywords for search
func (q *Query) Q() string {
	return q.q
}

func (q *Query) Workspace() id.WorkspaceID {
	return q.workspace
}

func (q *Query) Project() id.ProjectID {
	return q.project
}

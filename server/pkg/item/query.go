package item

import "github.com/reearth/reearth-cms/server/pkg/id"

type Query struct {
	project id.ProjectID
	q       string
}

func NewQuery(project id.ProjectID, q string) *Query {
	return &Query{
		project: project,
		q:       q,
	}
}

// Q returns keywords for search
func (q *Query) Q() string {
	return q.q
}

func (q *Query) Project() id.ProjectID {
	return q.project
}

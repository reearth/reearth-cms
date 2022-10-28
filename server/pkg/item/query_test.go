package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewQuery(t *testing.T) {
	wid := id.NewWorkspaceID()
	pid := id.NewProjectID()
	str := "foo"
	type args struct {
		workspace id.WorkspaceID
		project   id.ProjectID
		q         string
	}
	tests := []struct {
		name string
		args args
		want *Query
	}{
		{
			name: "",
			args: args{
				workspace: wid,
				project:   pid,
				q:         str,
			},
			want: &Query{
				workspace: wid,
				project:   pid,
				q:         "foo",
			},
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			got := NewQuery(tc.args.workspace, tc.args.project, tc.args.q)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestQuery_Project(t *testing.T) {
	pid := id.NewProjectID()
	q := &Query{
		project: pid,
	}
	assert.Equal(t, pid, q.Project())
}

func TestQuery_Q(t *testing.T) {
	wid := id.NewWorkspaceID()
	q := &Query{
		workspace: wid,
	}
	assert.Equal(t, wid, q.Workspace())
}

func TestQuery_Workspace(t *testing.T) {
	str := "foo"
	q := &Query{
		q: str,
	}
	assert.Equal(t, str, q.Q())
}

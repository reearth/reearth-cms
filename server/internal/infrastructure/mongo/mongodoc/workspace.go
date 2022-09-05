package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearthx/mongox"
)

type WorkspaceMemberDocument struct {
	Role string
}

type WorkspaceDocument struct {
	ID       string
	Name     string
	Members  map[string]WorkspaceMemberDocument
	Personal bool
}

func NewWorkspace(ws *user.Workspace) (*WorkspaceDocument, string) {
	membersDoc := map[string]WorkspaceMemberDocument{}
	for user, r := range ws.Members().Members() {
		membersDoc[user.String()] = WorkspaceMemberDocument{
			Role: string(r),
		}
	}
	id := ws.ID().String()
	return &WorkspaceDocument{
		ID:       id,
		Name:     ws.Name(),
		Members:  membersDoc,
		Personal: ws.IsPersonal(),
	}, id
}

func (d *WorkspaceDocument) Model() (*user.Workspace, error) {
	tid, err := id.WorkspaceIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	members := map[id.UserID]user.Role{}
	if d.Members != nil {
		for uid, member := range d.Members {
			uid, err := id.UserIDFrom(uid)
			if err != nil {
				return nil, err
			}
			members[uid] = user.Role(member.Role)
		}
	}
	return user.NewWorkspace().
		ID(tid).
		Name(d.Name).
		Members(members).
		Personal(d.Personal).
		Build()
}

func NewWorkspaces(workspaces []*user.Workspace) ([]*WorkspaceDocument, []string) {
	res := make([]*WorkspaceDocument, 0, len(workspaces))
	ids := make([]string, 0, len(workspaces))
	for _, d := range workspaces {
		if d == nil {
			continue
		}
		r, id := NewWorkspace(d)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}

type WorkspaceConsumer = mongox.SliceFuncConsumer[*WorkspaceDocument, *user.Workspace]

func NewWorkspaceConsumer() *WorkspaceConsumer {
	return NewComsumer[*WorkspaceDocument, *user.Workspace]()
}

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
	ID           string
	Name         string
	Members      map[string]WorkspaceMemberDocument
	Integrations map[string]WorkspaceMemberDocument
	Personal     bool
}

func NewWorkspace(ws *user.Workspace) (*WorkspaceDocument, string) {
	membersDoc := map[string]WorkspaceMemberDocument{}
	for uId, r := range ws.Members().Users() {
		membersDoc[uId.String()] = WorkspaceMemberDocument{
			Role: string(r),
		}
	}
	integrationsDoc := map[string]WorkspaceMemberDocument{}
	for iId, r := range ws.Members().Integrations() {
		membersDoc[iId.String()] = WorkspaceMemberDocument{
			Role: string(r),
		}
	}
	wId := ws.ID().String()
	return &WorkspaceDocument{
		ID:           wId,
		Name:         ws.Name(),
		Members:      membersDoc,
		Integrations: integrationsDoc,
		Personal:     ws.IsPersonal(),
	}, wId
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
	integrations := map[id.IntegrationID]user.Role{}
	if d.Integrations != nil {
		for iId, memberDoc := range d.Members {
			iId, err := id.IntegrationIDFrom(iId)
			if err != nil {
				return nil, err
			}
			integrations[iId] = user.Role(memberDoc.Role)
		}
	}
	return user.NewWorkspace().
		ID(tid).
		Name(d.Name).
		Members(members).
		Integrations(integrations).
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
		r, wId := NewWorkspace(d)
		res = append(res, r)
		ids = append(ids, wId)
	}
	return res, ids
}

type WorkspaceConsumer = mongox.SliceFuncConsumer[*WorkspaceDocument, *user.Workspace]

func NewWorkspaceConsumer() *WorkspaceConsumer {
	return NewComsumer[*WorkspaceDocument, *user.Workspace]()
}

package usecase

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/stretchr/testify/assert"
)

func TestOperator_Workspaces(t *testing.T) {
	u := id.NewUserID()
	w1, w2, w3, w4 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID(), id.NewWorkspaceID(), id.NewWorkspaceID()
	op := Operator{
		User:                   &u,
		Integration:            nil,
		ReadableWorkspaces:     id.WorkspaceIDList{w1},
		WritableWorkspaces:     id.WorkspaceIDList{w2},
		MaintainableWorkspaces: id.WorkspaceIDList{w3},
		OwningWorkspaces:       id.WorkspaceIDList{w4},
	}

	assert.Equal(t, op.Workspaces(workspace.RoleReader), []id.WorkspaceID{w1})
	assert.Equal(t, op.Workspaces(workspace.RoleWriter), []id.WorkspaceID{w2})
	assert.Equal(t, op.Workspaces(workspace.RoleMaintainer), []id.WorkspaceID{w3})
	assert.Equal(t, op.Workspaces(workspace.RoleOwner), []id.WorkspaceID{w4})
	assert.Nil(t, op.Workspaces(""))
	assert.Nil(t, (*Operator)(nil).Workspaces(""))

	assert.Equal(t, op.AllReadableWorkspaces(), id.WorkspaceIDList{w1, w2, w3, w4})
	assert.Equal(t, op.AllWritableWorkspaces(), id.WorkspaceIDList{w2, w3, w4})
	assert.Equal(t, op.AllMaintainingWorkspaces(), id.WorkspaceIDList{w3, w4})
	assert.Equal(t, op.AllOwningWorkspaces(), id.WorkspaceIDList{w4})

	assert.True(t, op.IsReadableWorkspace(w1))
	assert.True(t, op.IsReadableWorkspace(w2))
	assert.True(t, op.IsReadableWorkspace(w3))
	assert.True(t, op.IsReadableWorkspace(w4))
	assert.False(t, op.IsReadableWorkspace(id.NewWorkspaceID()))

	assert.False(t, op.IsWritableWorkspace(w1))
	assert.True(t, op.IsWritableWorkspace(w2))
	assert.True(t, op.IsWritableWorkspace(w3))
	assert.True(t, op.IsWritableWorkspace(w4))
	assert.False(t, op.IsWritableWorkspace(id.NewWorkspaceID()))

	assert.False(t, op.IsMaintainingWorkspace(w1))
	assert.False(t, op.IsMaintainingWorkspace(w2))
	assert.True(t, op.IsMaintainingWorkspace(w3))
	assert.True(t, op.IsMaintainingWorkspace(w4))
	assert.False(t, op.IsMaintainingWorkspace(id.NewWorkspaceID()))

	assert.False(t, op.IsOwningWorkspace(w1))
	assert.False(t, op.IsOwningWorkspace(w2))
	assert.False(t, op.IsOwningWorkspace(w3))
	assert.True(t, op.IsOwningWorkspace(w4))
	assert.False(t, op.IsOwningWorkspace(id.NewWorkspaceID()))

	w5 := id.NewWorkspaceID()
	op.AddNewWorkspace(w5)
	assert.Equal(t, user.WorkspaceIDList{w4, w5}, op.OwningWorkspaces)
}

func TestOperator_Projects(t *testing.T) {
	u := id.NewUserID()
	p1, p2, p3, p4 := id.NewProjectID(), id.NewProjectID(), id.NewProjectID(), id.NewProjectID()
	op := Operator{
		User:                 &u,
		Integration:          nil,
		ReadableProjects:     id.ProjectIDList{p1},
		WritableProjects:     id.ProjectIDList{p2},
		MaintainableProjects: id.ProjectIDList{p3},
		OwningProjects:       id.ProjectIDList{p4},
	}

	assert.Equal(t, op.Projects(workspace.RoleReader), project.IDList{p1})
	assert.Equal(t, op.Projects(workspace.RoleWriter), project.IDList{p2})
	assert.Equal(t, op.Projects(workspace.RoleMaintainer), project.IDList{p3})
	assert.Equal(t, op.Projects(workspace.RoleOwner), project.IDList{p4})
	assert.Nil(t, ((*Operator)(nil)).Projects(workspace.RoleReader))
	assert.Nil(t, op.Projects(""))

	assert.Equal(t, op.AllReadableProjects(), id.ProjectIDList{p1, p2, p3, p4})
	assert.Equal(t, op.AllWritableProjects(), id.ProjectIDList{p2, p3, p4})
	assert.Equal(t, op.AllMaintainableProjects(), id.ProjectIDList{p3, p4})
	assert.Equal(t, op.AllOwningProjects(), id.ProjectIDList{p4})

	assert.True(t, op.IsReadableProject(p1))
	assert.True(t, op.IsReadableProject(p2))
	assert.True(t, op.IsReadableProject(p3))
	assert.True(t, op.IsReadableProject(p4))
	assert.False(t, op.IsReadableProject(id.NewProjectID()))

	assert.False(t, op.IsWritableProject(p1))
	assert.True(t, op.IsWritableProject(p2))
	assert.True(t, op.IsWritableProject(p3))
	assert.True(t, op.IsWritableProject(p4))
	assert.False(t, op.IsWritableProject(id.NewProjectID()))

	assert.False(t, op.IsMaintainingProject(p1))
	assert.False(t, op.IsMaintainingProject(p2))
	assert.True(t, op.IsMaintainingProject(p3))
	assert.True(t, op.IsMaintainingProject(p4))
	assert.False(t, op.IsMaintainingProject(id.NewProjectID()))

	assert.False(t, op.IsOwningProject(p1))
	assert.False(t, op.IsOwningProject(p2))
	assert.False(t, op.IsOwningProject(p3))
	assert.True(t, op.IsOwningProject(p4))
	assert.False(t, op.IsOwningProject(id.NewProjectID()))

	p5 := id.NewProjectID()
	op.AddNewProject(p5)
	assert.Equal(t, project.IDList{p4, p5}, op.OwningProjects)
}

func TestOperator_Operator(t *testing.T) {
	uId := id.NewUserID()
	op := Operator{
		Integration: nil,
		AcOperator: &accountusecase.Operator{
			User: &uId,
		},
	}

	eOp := op.Operator()

	assert.NotNil(t, eOp.User())
	assert.Nil(t, eOp.Integration())
	assert.Equal(t, &uId, eOp.User())
	assert.False(t, eOp.Machine())

	iId := id.NewIntegrationID()

	op = Operator{
		Integration: &iId,
		AcOperator: &accountusecase.Operator{
			User: nil,
		},
	}

	eOp = op.Operator()

	assert.Nil(t, eOp.User())
	assert.NotNil(t, eOp.Integration())
	assert.Equal(t, &iId, eOp.Integration())
	assert.False(t, eOp.Machine())

	op = Operator{
		Machine: true,
	}

	eOp = op.Operator()

	assert.Nil(t, eOp.User())
	assert.Nil(t, eOp.Integration())
	assert.True(t, eOp.Machine())
}

type ownable struct {
	U *id.UserID
	I *id.IntegrationID
	P id.ProjectID
}

func (o ownable) User() *id.UserID {
	return o.U
}
func (o ownable) Integration() *id.IntegrationID {
	return o.I
}
func (o ownable) Project() id.ProjectID {
	return o.P
}

func TestOperator_Checks(t *testing.T) {
	uId := id.NewUserID()
	pId := id.NewProjectID()
	op := Operator{
		User:             &uId,
		Integration:      nil,
		WritableProjects: project.IDList{pId},
	}

	obj := ownable{U: &uId, P: pId}

	assert.True(t, op.Owns(obj))

	assert.True(t, op.CanUpdate(obj))
}

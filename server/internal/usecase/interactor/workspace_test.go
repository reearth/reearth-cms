package interactor

//func TestCreateWorkspace(t *testing.T) {
//	ctx := context.Background()
//
//	db := memory.InitRepos(nil)
//
//	u := user.New().NewID().Email("aaa@bbb.com").Workspace(id.NewWorkspaceID()).MustBuild()
//	workspaceUC := NewWorkspace(db)
//	op := &usecase.Operator{User: u.ID()}
//	workspace, err := workspaceUC.Create(ctx, "workspace name", u.ID(), op)
//
//	assert.Nil(t, err)
//	assert.NotNil(t, workspace)
//
//	resultWorkspaces, _ := workspaceUC.Fetch(ctx, []id.WorkspaceID{workspace.ID()}, &usecase.Operator{
//		ReadableWorkspaces: []id.WorkspaceID{workspace.ID()},
//	})
//
//	assert.NotNil(t, resultWorkspaces)
//	assert.NotEmpty(t, resultWorkspaces)
//	assert.Equal(t, resultWorkspaces[0].ID(), workspace.ID())
//	assert.Equal(t, resultWorkspaces[0].Name(), "workspace name")
//	assert.Equal(t, user.WorkspaceIDList{resultWorkspaces[0].ID()}, op.OwningWorkspaces)
//}

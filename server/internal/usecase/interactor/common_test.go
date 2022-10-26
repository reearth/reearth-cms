package interactor

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/stretchr/testify/assert"
)

func TestCommon_New(t *testing.T) {
	r := &repo.Container{}
	g := &gateway.Container{}
	c := ContainerConfig{}

	want := interfaces.Container{
		Asset:       NewAsset(r, g),
		Workspace:   NewWorkspace(r),
		User:        NewUser(r, g, c.SignupSecret, c.AuthSrvUIDomain),
		Project:     NewProject(r),
		Item:        NewItem(r),
		Model:       NewModel(r),
		Schema:      NewSchema(r),
		Integration: NewIntegration(r),
		Thread:      NewThread(r),
	}

	got := New(r, g, c)

	assert.Equal(t, want, got)
}

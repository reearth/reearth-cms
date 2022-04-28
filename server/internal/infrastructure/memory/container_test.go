package memory

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/stretchr/testify/assert"
)

func TestInitRepos(t *testing.T) {
	expected := &repo.Container{
		Lock:        &Lock{},
		User:        &User{},
		Transaction: &Transaction{},
		Workspace:   &Workspace{},
	}
	got := InitRepos()
	assert.Equal(t, expected, got)
}

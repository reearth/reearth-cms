package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestIntegrationRepo(t *testing.T) {
	repotest.TestIntegrationRepo(t, func(*testing.T) repo.Integration {
		return NewIntegration()
	})
}

func TestIntegration_MemorySpecific_Errors(t *testing.T) {
	ctx := context.Background()
	wantErr := errors.New("test")
	i := integration.New().NewID().Developer(accountdomain.NewUserID()).Type(integration.TypePrivate).Token("token").MustBuild()

	r := NewIntegration()
	assert.NoError(t, r.Save(ctx, i))
	SetIntegrationError(r, wantErr)

	err := func(rets ...any) error { return rets[len(rets)-1].(error) }

	assert.Same(t, wantErr, err(r.FindByID(ctx, i.ID())))
	assert.Same(t, wantErr, err(r.FindByIDs(ctx, id.IntegrationIDList{i.ID()})))
	assert.Same(t, wantErr, err(r.FindByUser(ctx, i.Developer())))
	assert.Same(t, wantErr, err(r.FindByToken(ctx, i.Token())))
	assert.Same(t, wantErr, err(r.Save(ctx, i)))
	assert.Same(t, wantErr, err(r.Remove(ctx, i.ID())))
	assert.Same(t, wantErr, err(r.RemoveMany(ctx, id.IntegrationIDList{i.ID()})))
}

package interactor

import (
	"context"
	"net/url"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway/gatewaymock"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/samber/lo"
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

func TestCommon_createEvent(t *testing.T) {
	now := time.Now()
	uID := user.NewID()
	a := asset.New().NewID().Project(project.NewID()).Size(100).CreatedBy(uID).File(asset.NewFile().Name("aaa.txt").Path("/aaa.txt").Size(100).Build()).MustBuild()
	workspace := user.NewWorkspace().NewID().MustBuild()
	wh := integration.NewWebhookBuilder().NewID().Name("aaa").Url(lo.Must(url.Parse("https://example.com"))).Active(true).Trigger(integration.WebhookTrigger{event.AssetCreate: true}).MustBuild()
	integration := integration.New().NewID().Developer(uID).Name("xxx").Webhook([]*integration.Webhook{wh}).MustBuild()
	lo.Must0(workspace.Members().AddIntegration(integration.ID(), user.RoleOwner, uID))
	expectedEv := event.New[any]().NewID().Timestamp(now).Type(event.AssetCreate).Operator(event.OperatorFromUser(uID)).Object(a).MustBuild()

	db := memory.New()
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	mRunner := gatewaymock.NewMockTaskRunner(mockCtrl)
	gw := &gateway.Container{
		TaskRunner: mRunner,
	}

	ctx := context.Background()
	lo.Must0(db.Workspace.Save(ctx, workspace))
	lo.Must0(db.Integration.Save(ctx, integration))

	mRunner.EXPECT().Run(ctx, task.WebhookPayload{
		Webhook: wh,
		Event:   expectedEv,
	}.Payload()).Times(1).Return(nil)
	err := createEvent(ctx, db, gw, workspace.ID(), event.Type(event.AssetCreate), a, event.OperatorFromUser(uID))
	assert.NoError(t, err)
	//TODO: check timestamp, id
	//TODO: mock id
	ev, err := db.Event.FindByID(ctx, expectedEv.ID())
	assert.NoError(t, err)
	assert.Equal(t, expectedEv, ev)
}

func TestCommon_webhook(t *testing.T) {
	now := time.Now()
	uID := user.NewID()
	a := asset.New().NewID().Project(project.NewID()).Size(100).CreatedBy(uID).File(asset.NewFile().Name("aaa.txt").Path("/aaa.txt").Size(100).Build()).MustBuild()
	workspace := user.NewWorkspace().NewID().MustBuild()
	wh := integration.NewWebhookBuilder().NewID().Name("aaa").Url(lo.Must(url.Parse("https://example.com"))).Active(true).Trigger(integration.WebhookTrigger{event.AssetCreate: true}).MustBuild()
	integration := integration.New().NewID().Developer(uID).Name("xxx").Webhook([]*integration.Webhook{wh}).MustBuild()
	lo.Must0(workspace.Members().AddIntegration(integration.ID(), user.RoleOwner, uID))
	ev := event.New[any]().NewID().Timestamp(now).Type(event.AssetCreate).Operator(event.OperatorFromUser(uID)).Object(a).MustBuild()

	db := memory.New()
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	mRunner := gatewaymock.NewMockTaskRunner(mockCtrl)
	gw := &gateway.Container{
		TaskRunner: mRunner,
	}

	ctx := context.Background()
	//no workspace
	err := webhook(ctx, db, gw, workspace.ID(), ev)
	assert.Error(t, err)

	lo.Must0(db.Workspace.Save(ctx, workspace))
	//no webhook call since no integrtaion
	mRunner.EXPECT().Run(ctx, task.WebhookPayload{
		Webhook: wh,
		Event:   ev,
	}.Payload()).Times(0).Return(nil)
	err = webhook(ctx, db, gw, workspace.ID(), ev)
	assert.NoError(t, err)

	lo.Must0(db.Integration.Save(ctx, integration))
	mRunner.EXPECT().Run(ctx, task.WebhookPayload{
		Webhook: wh,
		Event:   ev,
	}.Payload()).Times(1).Return(nil)
	err = webhook(ctx, db, gw, workspace.ID(), ev)
	assert.NoError(t, err)
}

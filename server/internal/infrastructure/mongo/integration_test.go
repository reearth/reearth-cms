package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	repotest "github.com/reearth/reearth-cms/server/internal/usecase/repo/test"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
)

func TestIntegrationRepo(t *testing.T) {
	init := mongotest.Connect(t)
	repotest.TestIntegrationRepo(t, func(t *testing.T) repo.Integration {
		return NewIntegration(mongox.NewClientWithDatabase(init(t)))
	})
}

func TestIntegration_KeepsMalformedWebhooks(t *testing.T) {
	init := mongotest.Connect(t)
	ctx := context.Background()
	client := mongox.NewClientWithDatabase(init(t))
	r := NewIntegration(client)

	iid, wid := id.NewIntegrationID(), id.NewWebhookID()
	malformed := mongodoc.WebhookDocument{ID: "invalid", Url: "https://example.com/bad", Secret: "secret"}
	_, err := client.WithCollection("integration").Client().InsertOne(ctx, mongodoc.IntegrationDocument{
		ID:        iid.String(),
		Type:      "private",
		Developer: accountdomain.NewUserID().String(),
		Webhook: []mongodoc.WebhookDocument{
			malformed,
			{ID: wid.String(), Url: "https://example.com/hook"},
		},
	})
	require.NoError(t, err)

	// the malformed webhook is skipped on read
	i, err := r.FindByID(ctx, iid)
	require.NoError(t, err)
	assert.Equal(t, []id.WebhookID{wid}, lo.Map(i.Webhooks(), func(w *integration.Webhook, _ int) id.WebhookID { return w.ID() }))

	// and kept on save
	i.SetName("renamed")
	require.NoError(t, r.Save(ctx, i))

	var stored mongodoc.IntegrationDocument
	require.NoError(t, client.WithCollection("integration").Client().FindOne(ctx, bson.M{"id": iid.String()}).Decode(&stored))
	assert.Equal(t, "renamed", stored.Name)
	assert.Equal(t, []mongodoc.WebhookDocument{malformed}, stored.MalformedWebhooks())
	assert.Len(t, stored.Webhook, 2)
}

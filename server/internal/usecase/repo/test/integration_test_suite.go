package test

import (
	"context"
	"errors"
	"net/url"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type integrationFactory = func(t *testing.T) repo.Integration

func TestIntegrationRepo(t *testing.T, newRepo integrationFactory) {
	t.Run("FindByID", func(t *testing.T) { testIntegrationFindByID(t, newRepo) })
	t.Run("FindByIDs", func(t *testing.T) { testIntegrationFindByIDs(t, newRepo) })
	t.Run("FindByUser", func(t *testing.T) { testIntegrationFindByUser(t, newRepo) })
	t.Run("FindByToken", func(t *testing.T) { testIntegrationFindByToken(t, newRepo) })
	t.Run("RoundTrip", func(t *testing.T) { testIntegrationRoundTrip(t, newRepo) })
	t.Run("Isolation", func(t *testing.T) { testIntegrationIsolation(t, newRepo) })
	t.Run("Save", func(t *testing.T) { testIntegrationSave(t, newRepo) })
	t.Run("Remove", func(t *testing.T) { testIntegrationRemove(t, newRepo) })
	t.Run("RemoveMany", func(t *testing.T) { testIntegrationRemoveMany(t, newRepo) })
}

func integrationNow() time.Time {
	return time.Now().Truncate(time.Millisecond).UTC()
}

func newIntegrationBuilder(developer accountdomain.UserID, webhooks ...*integration.Webhook) *integration.Builder {
	return integration.New().
		NewID().
		Name("integration").
		Description("description").
		Type(integration.TypePrivate).
		LogoUrl(lo.Must(url.Parse("https://example.com/logo.png"))).
		GenerateToken().
		Developer(developer).
		Webhook(append([]*integration.Webhook{}, webhooks...)).
		UpdatedAt(integrationNow())
}

func newIntegration(developer accountdomain.UserID, webhooks ...*integration.Webhook) *integration.Integration {
	return newIntegrationBuilder(developer, webhooks...).MustBuild()
}

func newIntegrationWebhook(active bool, trigger integration.WebhookTrigger) *integration.Webhook {
	return integration.NewWebhookBuilder().
		NewID().
		Name("webhook").
		Url(lo.Must(url.Parse("https://example.com/hook"))).
		Active(active).
		Trigger(trigger).
		Secret("secret").
		UpdatedAt(integrationNow()).
		MustBuild()
}

func seedIntegrations(t *testing.T, r repo.Integration, seeds integration.List) {
	t.Helper()
	for _, i := range seeds {
		require.NoError(t, r.Save(context.Background(), i))
	}
}

func integrationIDs(l integration.List) id.IntegrationIDList {
	return util.Map(l, func(i *integration.Integration) id.IntegrationID { return i.ID() })
}

func storedIntegrations(t *testing.T, r repo.Integration, ids id.IntegrationIDList) integration.List {
	t.Helper()
	var res integration.List
	for _, iid := range ids {
		i, err := r.FindByID(context.Background(), iid)
		if errors.Is(err, rerror.ErrNotFound) {
			continue
		}
		require.NoError(t, err)
		res = append(res, i)
	}
	return res
}

func testIntegrationFindByID(t *testing.T, newRepo integrationFactory) {
	ctx := context.Background()
	u1, u2 := accountdomain.NewUserID(), accountdomain.NewUserID()
	u1i1 := newIntegration(u1, newIntegrationWebhook(true, integration.WebhookTrigger{event.ItemCreate: true}))
	u1i2 := newIntegration(u1)
	u2i1 := newIntegration(u2)
	seeds := integration.List{u1i1, u1i2, u2i1}

	tests := []struct {
		name    string
		seeds   integration.List
		args    id.IntegrationID
		want    *integration.Integration
		wantErr error
	}{
		{
			name:  "must find an integration with webhooks",
			seeds: seeds,
			args:  u1i1.ID(),
			want:  u1i1,
		},
		{
			name:  "must find an integration without webhooks",
			seeds: seeds,
			args:  u1i2.ID(),
			want:  u1i2,
		},
		{
			name:  "must find an integration of any developer",
			seeds: seeds,
			args:  u2i1.ID(),
			want:  u2i1,
		},
		{
			name:    "must not find an unknown integration",
			seeds:   seeds,
			args:    id.NewIntegrationID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any integration in an empty repository",
			args:    u1i1.ID(),
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedIntegrations(t, r, tc.seeds)

			got, err := r.FindByID(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testIntegrationFindByIDs(t *testing.T, newRepo integrationFactory) {
	ctx := context.Background()
	u1, u2 := accountdomain.NewUserID(), accountdomain.NewUserID()
	u1i1 := newIntegration(u1)
	u1i2 := newIntegration(u1)
	u2i1 := newIntegration(u2)
	seeds := integration.List{u1i1, u1i2, u2i1}

	tests := []struct {
		name    string
		seeds   integration.List
		args    id.IntegrationIDList
		want    integration.List
		wantErr error
	}{
		{
			name:  "must find nothing for an empty list",
			seeds: seeds,
			args:  id.IntegrationIDList{},
		},
		{
			name:  "must find nothing for a nil list",
			seeds: seeds,
		},
		{
			name:  "must find a single integration",
			seeds: seeds,
			args:  id.IntegrationIDList{u1i2.ID()},
			want:  integration.List{u1i2},
		},
		{
			name:  "must find integrations of any developer",
			seeds: seeds,
			args:  id.IntegrationIDList{u1i1.ID(), u1i2.ID(), u2i1.ID()},
			want:  integration.List{u1i1, u1i2, u2i1},
		},
		{
			name:  "must keep the order of the given IDs",
			seeds: seeds,
			args:  id.IntegrationIDList{u2i1.ID(), u1i2.ID(), u1i1.ID()},
			want:  integration.List{u2i1, u1i2, u1i1},
		},
		{
			name:  "must skip unknown IDs",
			seeds: seeds,
			args:  id.IntegrationIDList{id.NewIntegrationID(), u1i2.ID(), id.NewIntegrationID(), u1i1.ID()},
			want:  integration.List{u1i2, u1i1},
		},
		{
			name: "must find nothing for an unknown ID in an empty repository",
			args: id.IntegrationIDList{id.NewIntegrationID()},
			want: integration.List{},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedIntegrations(t, r, tc.seeds)

			got, err := r.FindByIDs(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testIntegrationFindByUser(t *testing.T, newRepo integrationFactory) {
	ctx := context.Background()
	u1, u2 := accountdomain.NewUserID(), accountdomain.NewUserID()
	u1i1 := newIntegration(u1)
	u1i2 := newIntegration(u1)
	u1i3 := newIntegration(u1)
	u2i1 := newIntegration(u2)
	seeds := integration.List{u1i3, u2i1, u1i1, u1i2}

	tests := []struct {
		name    string
		seeds   integration.List
		args    accountdomain.UserID
		want    integration.List
		wantErr error
	}{
		{
			name:  "must find all integrations of a developer",
			seeds: seeds,
			args:  u1,
			want:  integration.List{u1i1, u1i2, u1i3},
		},
		{
			name:  "must find the only integration of a developer",
			seeds: seeds,
			args:  u2,
			want:  integration.List{u2i1},
		},
		{
			name:  "must find nothing for an unknown developer",
			seeds: seeds,
			args:  accountdomain.NewUserID(),
		},
		{
			name: "must find nothing in an empty repository",
			args: u1,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedIntegrations(t, r, tc.seeds)

			got, err := r.FindByUser(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			// TODO: mongo applies no sort (it returns the natural order, in
			// practice the insertion order) while memory sorts by ID, so the
			// order is not part of the contract yet.
			assert.Equal(t, tc.want.SortByID(), got.SortByID())
		})
	}
}

func testIntegrationFindByToken(t *testing.T, newRepo integrationFactory) {
	ctx := context.Background()
	u1 := accountdomain.NewUserID()
	i1 := newIntegration(u1)
	i2 := newIntegration(u1)
	custom := newIntegrationBuilder(u1).Token("secret_custom").MustBuild()
	seeds := integration.List{i1, i2, custom}

	// TODO: an integration with an empty token is found by an empty token;
	// left out as the auth middleware never looks up an empty token.
	tests := []struct {
		name    string
		seeds   integration.List
		args    string
		want    *integration.Integration
		wantErr error
	}{
		{
			name:  "must find an integration by its token",
			seeds: seeds,
			args:  i2.Token(),
			want:  i2,
		},
		{
			name:  "must find an integration by a token that was set explicitly",
			seeds: seeds,
			args:  "secret_custom",
			want:  custom,
		},
		{
			name:    "must not find an unknown token",
			seeds:   seeds,
			args:    "secret_unknown",
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find an empty token",
			seeds:   seeds,
			args:    "",
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a prefix of a token",
			seeds:   seeds,
			args:    "secret_",
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find a token with a different case",
			seeds:   seeds,
			args:    "SECRET_CUSTOM",
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any token in an empty repository",
			args:    i1.Token(),
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedIntegrations(t, r, tc.seeds)

			got, err := r.FindByToken(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

// testIntegrationRoundTrip checks that every field of an integration and its
// webhooks survives a save and find round trip.
//
// TODO: these are left out as mongo does not keep them:
//   - a nil logo URL or a webhook with a nil URL makes Save panic
//   - a nil webhook list and a nil trigger are read back as empty ones
//   - an empty or unknown type is read back as private
//   - an empty logo URL is read back as an empty, non-nil URL
//   - a zero developer is saved, but the integration can no longer be read
//   - a time that is not in UTC (e.g. the default UpdatedAt) is read back in UTC
func testIntegrationRoundTrip(t *testing.T, newRepo integrationFactory) {
	ctx := context.Background()
	u := accountdomain.NewUserID()
	allTriggers := integration.WebhookTrigger{
		event.ItemCreate:       true,
		event.ItemUpdate:       true,
		event.ItemDelete:       true,
		event.ItemPublish:      true,
		event.ItemUnpublish:    true,
		event.AssetCreate:      true,
		event.AssetDecompress:  true,
		event.AssetDelete:      true,
		event.AssetBatchDelete: true,
	}

	tests := []struct {
		name string
		args *integration.Integration
	}{
		{
			name: "must keep a private integration",
			args: newIntegrationBuilder(u).Type(integration.TypePrivate).MustBuild(),
		},
		{
			name: "must keep a public integration",
			args: newIntegrationBuilder(u).Type(integration.TypePublic).MustBuild(),
		},
		{
			name: "must keep empty texts",
			args: newIntegrationBuilder(u).Name("").Description("").Token("").MustBuild(),
		},
		{
			name: "must keep multibyte texts",
			args: newIntegrationBuilder(u).Name("インテグレーション 🔌").Description("説明\n2行目").MustBuild(),
		},
		{
			name: "must keep a logo URL with user info, query and fragment",
			args: newIntegrationBuilder(u).LogoUrl(lo.Must(url.Parse("https://user:pass@example.com:8080/a/logo.png?size=1&v=2#top"))).MustBuild(),
		},
		{
			name: "must keep the updated time",
			args: newIntegrationBuilder(u).UpdatedAt(time.Date(2020, 1, 2, 3, 4, 5, 6_000_000, time.UTC)).MustBuild(),
		},
		{
			name: "must keep an active webhook with all triggers enabled",
			args: newIntegration(u, newIntegrationWebhook(true, allTriggers)),
		},
		{
			name: "must keep an inactive webhook",
			args: newIntegration(u, newIntegrationWebhook(false, integration.WebhookTrigger{event.ItemCreate: true})),
		},
		{
			name: "must keep a webhook without triggers",
			args: newIntegration(u, newIntegrationWebhook(true, integration.WebhookTrigger{})),
		},
		{
			name: "must keep disabled triggers",
			args: newIntegration(u, newIntegrationWebhook(true, integration.WebhookTrigger{event.ItemCreate: true, event.ItemDelete: false})),
		},
		{
			name: "must keep a webhook with empty texts",
			args: newIntegration(u, integration.NewWebhookBuilder().
				NewID().
				Url(lo.Must(url.Parse("https://example.com/hook"))).
				Trigger(integration.WebhookTrigger{}).
				UpdatedAt(integrationNow()).
				MustBuild()),
		},
		{
			name: "must keep the order of webhooks",
			args: newIntegration(u,
				newIntegrationWebhook(true, integration.WebhookTrigger{event.ItemCreate: true}),
				newIntegrationWebhook(false, integration.WebhookTrigger{event.AssetCreate: true}),
				newIntegrationWebhook(true, integration.WebhookTrigger{event.ItemPublish: true}),
			),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			require.NoError(t, r.Save(ctx, tc.args))

			got, err := r.FindByID(ctx, tc.args.ID())
			assert.NoError(t, err)
			assert.Equal(t, tc.args, got)
		})
	}
}

func testIntegrationIsolation(t *testing.T, newRepo integrationFactory) {
	ctx := context.Background()

	tests := []struct {
		name   string
		mutate func(saved, found *integration.Integration)
	}{
		{
			name:   "must not keep changes made to a saved integration",
			mutate: func(saved, _ *integration.Integration) { saved.SetName("changed") },
		},
		{
			name:   "must not keep changes made to a found integration",
			mutate: func(_, found *integration.Integration) { found.SetName("changed") },
		},
		{
			name:   "must not keep changes made to the logo URL of a found integration",
			mutate: func(_, found *integration.Integration) { found.LogoUrl().Host = "changed.example.com" },
		},
		{
			name: "must not keep a webhook added to a found integration",
			mutate: func(_, found *integration.Integration) {
				found.AddWebhook(newIntegrationWebhook(true, integration.WebhookTrigger{}))
			},
		},
		{
			name:   "must not keep changes made to a webhook of a saved integration",
			mutate: func(saved, _ *integration.Integration) { saved.Webhooks()[0].SetActive(false) },
		},
		{
			name:   "must not keep changes made to a webhook of a found integration",
			mutate: func(_, found *integration.Integration) { found.Webhooks()[0].SetSecret("changed") },
		},
		{
			name: "must not keep changes made to a webhook trigger of a found integration",
			mutate: func(_, found *integration.Integration) {
				found.Webhooks()[0].Trigger().Enable(event.ItemDelete)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saved := newIntegration(accountdomain.NewUserID(), newIntegrationWebhook(true, integration.WebhookTrigger{event.ItemCreate: true}))
			want := saved.Clone()
			require.NoError(t, r.Save(ctx, saved))
			found, err := r.FindByID(ctx, saved.ID())
			require.NoError(t, err)
			assert.Equal(t, want, found)
			assert.NotSame(t, saved, found)

			tc.mutate(saved, found)

			got, err := r.FindByID(ctx, saved.ID())
			assert.NoError(t, err)
			assert.Equal(t, want, got)
		})
	}
}

func testIntegrationSave(t *testing.T, newRepo integrationFactory) {
	ctx := context.Background()
	u1, u2 := accountdomain.NewUserID(), accountdomain.NewUserID()
	i1 := newIntegration(u1, newIntegrationWebhook(true, integration.WebhookTrigger{event.ItemCreate: true}))
	i2 := newIntegration(u1)
	i1Updated := integration.New().
		ID(i1.ID()).
		Name("updated").
		Description("updated").
		Type(integration.TypePublic).
		LogoUrl(lo.Must(url.Parse("https://example.com/updated.png"))).
		Token("secret_updated").
		Developer(u2).
		Webhook([]*integration.Webhook{}).
		UpdatedAt(integrationNow().Add(time.Hour)).
		MustBuild()

	tests := []struct {
		name  string
		seeds integration.List
		args  *integration.Integration
		want  integration.List // the stored integrations afterwards
	}{
		{
			name: "must save a new integration",
			args: i1,
			want: integration.List{i1},
		},
		{
			name:  "must save a new integration next to existing ones",
			seeds: integration.List{i2},
			args:  i1,
			want:  integration.List{i1, i2},
		},
		{
			name:  "must overwrite every field of an existing integration",
			seeds: integration.List{i1, i2},
			args:  i1Updated,
			want:  integration.List{i1Updated, i2},
		},
		{
			name:  "must keep an integration saved twice unchanged",
			seeds: integration.List{i1, i2},
			args:  i1,
			want:  integration.List{i1, i2},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedIntegrations(t, r, tc.seeds)

			assert.NoError(t, r.Save(ctx, tc.args))
			assert.Equal(t, tc.want, storedIntegrations(t, r, id.IntegrationIDList{i1.ID(), i2.ID()}))
		})
	}
}

func testIntegrationRemove(t *testing.T, newRepo integrationFactory) {
	ctx := context.Background()
	u := accountdomain.NewUserID()
	i1 := newIntegration(u)
	i2 := newIntegration(u)
	i3 := newIntegration(accountdomain.NewUserID())
	seeds := integration.List{i1, i2, i3}

	tests := []struct {
		name    string
		seeds   integration.List
		args    id.IntegrationID
		want    integration.List // integrations that must remain after the call
		wantErr error
	}{
		{
			name:  "must remove an integration",
			seeds: seeds,
			args:  i2.ID(),
			want:  integration.List{i1, i3},
		},
		{
			name:  "must remove the last integration",
			seeds: integration.List{i1},
			args:  i1.ID(),
		},
		{
			name:    "must not remove an unknown integration",
			seeds:   seeds,
			args:    id.NewIntegrationID(),
			want:    seeds,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not remove anything from an empty repository",
			args:    i1.ID(),
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedIntegrations(t, r, tc.seeds)

			assert.Equal(t, tc.wantErr, r.Remove(ctx, tc.args))
			assert.Equal(t, tc.want, storedIntegrations(t, r, integrationIDs(seeds)))
		})
	}
}

func testIntegrationRemoveMany(t *testing.T, newRepo integrationFactory) {
	ctx := context.Background()
	u := accountdomain.NewUserID()
	i1 := newIntegration(u)
	i2 := newIntegration(u)
	i3 := newIntegration(accountdomain.NewUserID())
	seeds := integration.List{i1, i2, i3}

	tests := []struct {
		name  string
		seeds integration.List
		args  id.IntegrationIDList
		want  integration.List // integrations that must remain after the call
	}{
		{
			name:  "must remove integrations of any developer",
			seeds: seeds,
			args:  id.IntegrationIDList{i1.ID(), i3.ID()},
			want:  integration.List{i2},
		},
		{
			name:  "must remove all integrations",
			seeds: seeds,
			args:  id.IntegrationIDList{i3.ID(), i2.ID(), i1.ID()},
		},
		{
			name:  "must remove known integrations and ignore unknown ones",
			seeds: seeds,
			args:  id.IntegrationIDList{id.NewIntegrationID(), i2.ID()},
			want:  integration.List{i1, i3},
		},
		{
			name:  "must ignore a list of only unknown integrations",
			seeds: seeds,
			args:  id.IntegrationIDList{id.NewIntegrationID(), id.NewIntegrationID()},
			want:  seeds,
		},
		{
			name:  "must remove nothing for an empty list",
			seeds: seeds,
			args:  id.IntegrationIDList{},
			want:  seeds,
		},
		{
			name:  "must remove nothing for a nil list",
			seeds: seeds,
			want:  seeds,
		},
		{
			name: "must remove nothing from an empty repository",
			args: id.IntegrationIDList{i1.ID()},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			seedIntegrations(t, r, tc.seeds)

			assert.NoError(t, r.RemoveMany(ctx, tc.args))
			assert.Equal(t, tc.want, storedIntegrations(t, r, integrationIDs(seeds)))
		})
	}
}

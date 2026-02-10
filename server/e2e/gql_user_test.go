package e2e

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	apiuser "github.com/reearth/reearth-accounts/server/pkg/user"
	apiworkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/account"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func baseSeederUser(ctx context.Context, r *repo.Container, g *gateway.Container) error {
	auth := user.ReearthSub(uId1.String())

	u1m := user.NewMetadata()
	u1m.SetTheme(user.ThemeDark)
	u1m.SetLang(language.English)

	u2m := user.NewMetadata()
	u2m.SetTheme(user.ThemeDefault)
	u2m.SetLang(language.Japanese)

	u := user.New().ID(uId1).
		Name("e2e").
		Email("e2e@e2e.com").
		Auths([]user.Auth{*auth}).
		Workspace(wId).
		Metadata(u1m).
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}
	u2 := user.New().ID(uId2).
		Name("e2e2").
		Workspace(wId2).
		Email("e2e2@e2e.com").
		Metadata(u2m).
		MustBuild()
	if err := r.User.Save(ctx, u2); err != nil {
		return err
	}
	u3 := user.New().ID(uId3).
		Name("e2e3").
		Workspace(wId2).
		Email("e2e3@e2e.com").
		Metadata(u2m).
		MustBuild()
	if err := r.User.Save(ctx, u3); err != nil {
		return err
	}
	u4 := user.New().ID(uId4).
		Name("e2e4").
		Workspace(wId).
		Email("e2e4@e2e.com").
		Metadata(u2m).
		MustBuild()
	if err := r.User.Save(ctx, u4); err != nil {
		return err
	}
	roleOwner := workspace.Member{
		Role:      workspace.RoleOwner,
		InvitedBy: uId1,
	}
	roleMaintainer := workspace.Member{
		Role:      workspace.RoleMaintainer,
		InvitedBy: uId1,
	}
	roleReader := workspace.Member{
		Role:      workspace.RoleReader,
		InvitedBy: uId2,
	}

	wMetadata := workspace.NewMetadata()
	w := workspace.New().ID(wId).
		Name("e2e").
		Alias("test-workspace").
		Members(map[idx.ID[accountdomain.User]]workspace.Member{
			uId1: roleOwner,
			uId4: roleMaintainer,
		}).
		Integrations(map[idx.ID[accountdomain.Integration]]workspace.Member{
			iId1: roleOwner,
		}).
		Metadata(wMetadata).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	w2 := workspace.New().ID(wId2).
		Name("e2e2").
		Members(map[idx.ID[accountdomain.User]]workspace.Member{
			uId1: roleOwner,
			uId3: roleReader,
		}).
		Integrations(map[idx.ID[accountdomain.Integration]]workspace.Member{
			iId1: roleOwner,
		}).
		Metadata(wMetadata).
		MustBuild()
	if err := r.Workspace.Save(ctx, w2); err != nil {
		return err
	}

	// Convert domain workspaces to API workspaces for the accounts gateway
	wid, _ := apiworkspace.IDFrom(wId.String())
	apiW := apiworkspace.New().
		ID(wid).
		Name("e2e").
		Alias("test-workspace").
		Personal(false).
		Members(map[apiworkspace.UserID]apiworkspace.Member{
			apiworkspace.UserID(uId1): {
				Role: apiworkspace.RoleOwner,
				Host: "",
			},
			apiworkspace.UserID(uId4): {
				Role: apiworkspace.RoleMaintainer,
				Host: "",
			},
		}).
		Integrations(map[apiworkspace.IntegrationID]apiworkspace.Member{
			apiworkspace.IntegrationID(iId1): {
				Role:      apiworkspace.RoleOwner,
				InvitedBy: apiworkspace.UserID(uId1),
				Disabled:  false,
			},
		}).
		MustBuild()

	wid2, _ := apiworkspace.IDFrom(wId2.String())
	apiW2 := apiworkspace.New().
		ID(wid2).
		Name("e2e2").
		Personal(false).
		Members(map[apiworkspace.UserID]apiworkspace.Member{
			apiworkspace.UserID(uId1): {
				Role: apiworkspace.RoleOwner,
				Host: "",
			},
			apiworkspace.UserID(uId3): {
				Role: apiworkspace.RoleReader,
				Host: "",
			},
		}).
		Integrations(map[apiworkspace.IntegrationID]apiworkspace.Member{
			apiworkspace.IntegrationID(iId1): {
				Role:      apiworkspace.RoleOwner,
				InvitedBy: apiworkspace.UserID(uId1),
				Disabled:  false,
			},
		}).
		MustBuild()

	// Convert users to API users and setup accounts gateway with workspaces
	apiUsers := lo.Map(user.List{u, u2, u3, u4}, func(pu *user.User, _ int) *apiuser.User {
		var photoURL, description, website string
		var lang language.Tag
		var theme apiuser.Theme

		if metadata := pu.Metadata(); metadata != nil {
			photoURL = metadata.PhotoURL()
			description = metadata.Description()
			website = metadata.Website()
			lang = metadata.Lang()
			theme = apiuser.Theme(metadata.Theme())
		}

		m := apiuser.MetadataFrom(photoURL, description, website, lang, theme)
		puID, _ := apiuser.IDFrom(pu.ID().String())
		ub := apiuser.New().
			ID(puID).
			Name(pu.Name()).
			Alias(pu.Alias()).
			Email(pu.Email()).
			Workspace(apiuser.WorkspaceID(pu.Workspace())).
			Metadata(m)
		apiU, _ := ub.Build()
		return apiU
	})

	g.Accounts = account.NewInMemoryWithWorkspaces(apiUsers, apiworkspace.List{apiW, apiW2})

	return nil
}

func TestUpdateMe(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	// Test updateMe for user 1 - full update
	query := `mutation { updateMe(input: {name: "updated",email:"hoge@test.com",lang: "ja",theme: DEFAULT,password: "Ajsownndww1",passwordConfirmation: "Ajsownndww1"}){ me{ id name email lang theme myWorkspaceId profilePictureUrl } }}`
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	o := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().Value("data").Object().Value("updateMe").Object().Value("me").Object()

	o.Value("id").String().IsEqual(uId1.String())
	o.Value("name").String().IsEqual("updated")
	o.Value("email").String().IsEqual("hoge@test.com")
	o.Value("lang").String().IsEqual("ja")
	o.Value("theme").String().IsEqual("default")
	o.Value("myWorkspaceId").String().IsEqual(wId.String())
	o.Value("profilePictureUrl").String().IsEqual("")

	// Test partial update for user 2 - only name and theme
	query2 := `mutation { updateMe(input: {name: "user2-updated", theme: LIGHT}){ me{ id name email lang theme myWorkspaceId profilePictureUrl } }}`
	request2 := GraphQLRequest{
		Query: query2,
	}
	jsonData2, err := json.Marshal(request2)
	if err != nil {
		assert.NoError(t, err)
	}
	o2 := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId2.String()).
		WithBytes(jsonData2).Expect().Status(http.StatusOK).JSON().Object().Value("data").Object().Value("updateMe").Object().Value("me").Object()

	o2.Value("id").String().IsEqual(uId2.String())
	o2.Value("name").String().IsEqual("user2-updated")
	o2.Value("email").String().IsEqual("e2e2@e2e.com") // Should remain unchanged
	o2.Value("lang").String().IsEqual("ja")            // Should remain unchanged
	o2.Value("theme").String().IsEqual("light")
	o2.Value("myWorkspaceId").String().IsEqual(wId2.String())
	o2.Value("profilePictureUrl").String().IsEqual("")

	// Test update with only email for user 3
	query3 := `mutation { updateMe(input: {email: "newemail@example.com"}){ me{ id name email lang theme myWorkspaceId profilePictureUrl } }}`
	request3 := GraphQLRequest{
		Query: query3,
	}
	jsonData3, err := json.Marshal(request3)
	if err != nil {
		assert.NoError(t, err)
	}
	o3 := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId3.String()).
		WithBytes(jsonData3).Expect().Status(http.StatusOK).JSON().Object().Value("data").Object().Value("updateMe").Object().Value("me").Object()

	o3.Value("id").String().IsEqual(uId3.String())
	o3.Value("name").String().IsEqual("e2e3") // Should remain unchanged
	o3.Value("email").String().IsEqual("newemail@example.com")
	o3.Value("lang").String().IsEqual("ja")       // Should remain unchanged
	o3.Value("theme").String().IsEqual("default") // Should remain unchanged
	o3.Value("myWorkspaceId").String().IsEqual(wId2.String())
	o3.Value("profilePictureUrl").String().IsEqual("")
}

func TestRemoveMyAuth(t *testing.T) {
	e, _, ar := StartServerWithRepos(t, &app.Config{}, true, baseSeederUser)

	u, err := ar.User.FindByID(context.Background(), uId1)
	assert.Nil(t, err)
	assert.Equal(t, &user.Auth{Provider: "reearth", Sub: "reearth|" + uId1.String()}, u.Auths().GetByProvider("reearth"))

	query := `mutation { removeMyAuth(input: {auth: "reearth"}){ me{ id name email lang theme } }}`
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object()

	u, err = ar.User.FindByID(context.Background(), uId1)
	assert.Nil(t, err)
	assert.Nil(t, u.Auths().Get("sub"))
}

func TestDeleteMe(t *testing.T) {
	e, _, ar := StartServerWithRepos(t, &app.Config{}, true, baseSeederUser)

	u, err := ar.User.FindByID(context.Background(), uId1)
	assert.Nil(t, err)
	assert.NotNil(t, u)

	query := fmt.Sprintf(`mutation { deleteMe(input: {userId: "%s"}){ userId }}`, uId1)
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object()

	_, err = ar.User.FindByID(context.Background(), uId1)
	assert.Equal(t, rerror.ErrNotFound, err)
}

func TestMe(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)
	query := ` { me{ id name email lang theme myWorkspaceId profilePictureUrl } }`
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	o := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().Value("data").Object().Value("me").Object()

	o.Value("id").String().IsEqual(uId1.String())
	o.Value("name").String().IsEqual("e2e")
	o.Value("email").String().IsEqual("e2e@e2e.com")
	o.Value("lang").String().IsEqual("en")
	o.Value("theme").String().IsEqual("dark")
	o.Value("myWorkspaceId").String().IsEqual(wId.String())
	o.Value("profilePictureUrl").String().IsEqual("")

	o = e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId2.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().Value("data").Object().Value("me").Object()
	o.Value("id").String().IsEqual(uId2.String())
	o.Value("name").String().IsEqual("e2e2")
	o.Value("email").String().IsEqual("e2e2@e2e.com")
	o.Value("lang").String().IsEqual("ja")
	o.Value("theme").String().IsEqual("default")
	o.Value("myWorkspaceId").String().IsEqual(wId2.String())
	o.Value("profilePictureUrl").String().IsEqual("")
}

func TestMeWorkspaces(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	// Test workspaces field for user 1 (member of both workspaces)
	query := `{ me{ id name workspaces { id name alias personal members { ... on WorkspaceUserMember { userId role } ... on WorkspaceIntegrationMember { integrationId role active } } } } }`
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	o := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().Value("data").Object().Value("me").Object()

	// User 1 should be a member of both workspaces
	workspaces := o.Value("workspaces").Array()
	workspaces.Length().IsEqual(2)

	// Check workspace details (order might vary)
	workspace1 := workspaces.Value(0).Object()
	workspace2 := workspaces.Value(1).Object()

	// Collect workspace names to verify both are present
	names := []string{
		workspace1.Value("name").String().Raw(),
		workspace2.Value("name").String().Raw(),
	}
	assert.Contains(t, names, "e2e")
	assert.Contains(t, names, "e2e2")

	// Test workspaces field for user 3 (member of only wId2/e2e2)
	o3 := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId3.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().Value("data").Object().Value("me").Object()

	// User 3 should be a member of only one workspace
	workspaces3 := o3.Value("workspaces").Array()
	workspaces3.Length().IsEqual(1)

	workspace3 := workspaces3.Value(0).Object()
	workspace3.Value("name").String().IsEqual("e2e2")
	workspace3.Value("alias").String().IsEqual("")
	workspace3.Value("personal").Boolean().IsFalse()

	// Check members array is present and has content
	members := workspace3.Value("members").Array()
	memberCount := members.Length().Raw()
	assert.True(t, memberCount > 0, "Workspace should have members")
}

func TestUserByNameOrEmail(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)
	query := fmt.Sprintf(` { userByNameOrEmail(nameOrEmail: "%s"){ id name email } }`, "e2e")
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	o := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().Value("data").Object().Value("userByNameOrEmail").Object()
	o.Value("id").String().IsEqual(uId1.String())
	o.Value("name").String().IsEqual("e2e")
	o.Value("email").String().IsEqual("e2e@e2e.com")

	query = fmt.Sprintf(` { userByNameOrEmail(nameOrEmail: "%s"){ id name email } }`, "notfound")
	request = GraphQLRequest{
		Query: query,
	}
	jsonData, err = json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().
		Value("data").Object().Value("userByNameOrEmail").IsNull()
}

func TestUserSearch(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)
	query := fmt.Sprintf(` { userSearch(keyword: "%s"){ id name email } }`, "e2e")
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	res := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object()
	ul := res.Value("data").Object().Value("userSearch").Array()
	ul.Length().IsEqual(4)
	o := ul.Value(0).Object()
	o.Value("id").String().IsEqual(uId1.String())
	o.Value("name").String().IsEqual("e2e")
	o.Value("email").String().IsEqual("e2e@e2e.com")

	query = fmt.Sprintf(` { userSearch(keyword: "%s"){ id name email } }`, "e2e2")
	request = GraphQLRequest{
		Query: query,
	}
	jsonData, err = json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	res = e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object()
	ul = res.Value("data").Object().Value("userSearch").Array()
	ul.Length().IsEqual(1)
	o = ul.Value(0).Object()
	o.Value("id").String().IsEqual(uId2.String())
	o.Value("name").String().IsEqual("e2e2")
	o.Value("email").String().IsEqual("e2e2@e2e.com")

	query = fmt.Sprintf(` { userSearch(keyword: "%s"){ id name email } }`, "notfound")
	request = GraphQLRequest{
		Query: query,
	}
	jsonData, err = json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().
		Value("data").Object().Value("userSearch").Array().IsEmpty()
}

func TestNode(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)
	query := fmt.Sprintf(` { node(id: "%s", type: USER){ id } }`, uId1.String())
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	o := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().Value("data").Object().Value("node").Object()
	o.Value("id").String().IsEqual(uId1.String())
}

func TestNodes(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)
	query := fmt.Sprintf(` { nodes(id: "%s", type: USER){ id } }`, uId1.String())
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}
	o := e.POST("/api/graphql").
		WithHeader("authorization", "Bearer test").
		WithHeader("Content-Type", "application/json").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().Value("data").Object().Value("nodes")
	o.Array().ContainsAny(map[string]string{"id": uId1.String()})
}

package e2e

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func baseSeederUser(ctx context.Context, r *repo.Container, _ *gateway.Container) error {
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

	return nil
}

func TestUpdateMe(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)
	query := `mutation { updateMe(input: {name: "updated",email:"hoge@test.com",lang: "ja",theme: DEFAULT,password: "Ajsownndww1",passwordConfirmation: "Ajsownndww1"}){ me{ id name email lang theme } }}`
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
	o.Value("name").String().IsEqual("updated")
	o.Value("email").String().IsEqual("hoge@test.com")
	o.Value("lang").String().IsEqual("ja")
	o.Value("theme").String().IsEqual("default")
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
	// Create mock external account API server
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Parse the GraphQL request
		var gqlReq struct {
			Query string `json:"query"`
		}
		_ = json.NewDecoder(r.Body).Decode(&gqlReq)

		// Check for Authorization header (JWT token forwarding)
		authHeader := r.Header.Get("Authorization")

		var response map[string]interface{}

		// Mock different users based on auth header or default to user1
		if authHeader == "Bearer test" {
			// Default to first user for "Bearer test"
			response = map[string]interface{}{
				"data": map[string]interface{}{
					"me": map[string]interface{}{
						"id":            uId1.String(),
						"name":          "e2e",
						"email":         "e2e@e2e.com",
						"host":          nil,
						"myWorkspaceId": wId.String(),
						"auths":         []string{"reearth"},
						"metadata": map[string]interface{}{
							"lang":     "en",
							"theme":    "DARK",
							"photoURL": "",
						},
						"myWorkspace": map[string]interface{}{
							"id":       wId.String(),
							"name":     "e2e",
							"alias":    "e2e",
							"personal": false,
							"member":   nil,
						},
						"workspaces": []map[string]interface{}{
							{
								"id":       wId.String(),
								"name":     "e2e",
								"alias":    "e2e",
								"personal": false,
								"member":   nil,
							},
						},
					},
				},
			}
		} else {
			// For other auth scenarios or user2
			response = map[string]interface{}{
				"data": map[string]interface{}{
					"me": map[string]interface{}{
						"id":            uId2.String(),
						"name":          "e2e2",
						"email":         "e2e2@e2e.com",
						"host":          nil,
						"myWorkspaceId": wId2.String(),
						"auths":         []string{},
						"metadata": map[string]interface{}{
							"lang":     "ja",
							"theme":    "DEFAULT",
							"photoURL": "",
						},
						"myWorkspace": map[string]interface{}{
							"id":       wId2.String(),
							"name":     "e2e2",
							"alias":    "e2e2",
							"personal": false,
							"member":   nil,
						},
						"workspaces": []map[string]interface{}{
							{
								"id":       wId2.String(),
								"name":     "e2e2",
								"alias":    "e2e2",
								"personal": false,
								"member":   nil,
							},
						},
					},
				},
			}
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(response)
	}))
	defer mockServer.Close()

	// Configure app to use mock external API
	cfg := &app.Config{
		Account_Api: app.AccountAPIConfig{
			Endpoint: mockServer.URL + "/graphql",
			// No token needed for mock
		},
	}

	e := StartServer(t, cfg, true, baseSeederUser)
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

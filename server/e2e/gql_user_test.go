package e2e

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"testing"

	"github.com/golang/mock/gomock"
	user_api "github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway/gatewaymock"
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

// Helper function to create a mock user from the accounts API package
func createMockUser(userID accountdomain.UserID, name, email string, workspaceID accountdomain.WorkspaceID, lang language.Tag, theme user_api.Theme) *user_api.User {
	// Create user metadata
	metadata := user_api.NewMetadata()
	metadata.SetLang(lang)
	metadata.SetTheme(theme)

	// Create IDs properly handling errors
	accountUserID, err := user_api.IDFrom(userID.String())
	if err != nil {
		panic(err) // This is a test helper, so panic is acceptable
	}

	accountWorkspaceID, err := user_api.WorkspaceIDFrom(workspaceID.String())
	if err != nil {
		panic(err) // This is a test helper, so panic is acceptable
	}

	// Create the user using the builder pattern
	mockUser := user_api.New().
		ID(accountUserID).
		Name(name).
		Email(email).
		Alias(name).
		Workspace(accountWorkspaceID).
		Metadata(metadata).
		MustBuild()

	return mockUser
}

func TestMe(t *testing.T) {
	// Check if Accounts is available
	accountsAPIHost := os.Getenv("REEARTH_ACCOUNTS_API_HOST")
	if accountsAPIHost == "" {
		accountsAPIHost = "http://localhost:8099/graphql"
	}

	accountsAPIAvailable := isAccountsAPIHealthy(accountsAPIHost)

	// Create a mock controller and account mock
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	query := ` { me{ id name email lang theme myWorkspaceId profilePictureUrl } }`
	request := GraphQLRequest{
		Query: query,
	}
	jsonData, err := json.Marshal(request)
	if err != nil {
		assert.NoError(t, err)
	}

	// Test case 1: Success case with mock returning valid user data
	t.Run("Success_Case_Mock_Returns_User", func(t *testing.T) {
		mockAccount := gatewaymock.NewMockAccount(ctrl)

		mockUser1 := createMockUser(uId1, "e2e", "e2e@e2e.com", wId, language.English, user_api.ThemeDark)

		mockAccount.EXPECT().FindMe(gomock.Any()).Return(mockUser1, nil).AnyTimes().Do(func(ctx context.Context) {
			t.Log("Mock FindMe called successfully")
		})

		// Create a custom seeder function that sets up both the mock and regular user data
		successSeeder := func(ctx context.Context, r *repo.Container, g *gateway.Container) error {
			// Set up the accounts mock for testing
			if g != nil {
				t.Log("Setting up mock account in gateway container")
				g.Accounts = mockAccount
			} else {
				t.Log("Warning: gateway container is nil")
			}

			return baseSeederUser(ctx, r, g)
		}

		e := StartServer(t, &app.Config{}, false, successSeeder)

		t.Log("Testing with Account Mock - success case")

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
	})

	// Test case 2: Failure case with mock returning error (simulating unavailable accounts API)
	t.Run("Failure_Case_Mock_Returns_Error", func(t *testing.T) {
		mockAccount := gatewaymock.NewMockAccount(ctrl)

		mockAccount.EXPECT().FindMe(gomock.Any()).Return(nil, errors.New("account api not available")).AnyTimes()

		failureSeeder := func(ctx context.Context, r *repo.Container, g *gateway.Container) error {
			// Set up the accounts mock for testing
			if g != nil {
				t.Log("Setting up failure mock account in gateway container")
				g.Accounts = mockAccount
			} else {
				t.Log("Warning: gateway container is nil in failure case")
			}
			// Run the base seeder
			return baseSeederUser(ctx, r, g)
		}

		e := StartServer(t, &app.Config{}, false, failureSeeder)

		t.Log("Testing with Account Mock - failure case (expecting errors)")
		e.POST("/api/graphql").
			WithHeader("authorization", "Bearer test").
			WithHeader("Content-Type", "application/json").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().
			Value("errors").Array().Length().IsEqual(1)

		e.POST("/api/graphql").
			WithHeader("authorization", "Bearer test").
			WithHeader("Content-Type", "application/json").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithBytes(jsonData).Expect().Status(http.StatusOK).JSON().Object().
			Value("errors").Array().Length().IsEqual(1)
	})

	// Log which approach was used for the original implementation
	if accountsAPIAvailable {
		t.Log("Note: Real Accounts API was available but tests used mocks instead")
	} else {
		t.Log("Note: Real Accounts API was not available - tests used mocks")
	}
}

// isAccountsAPIHealthy checks if the accounts API is available for testing
func isAccountsAPIHealthy(host string) bool {
	healthURL := strings.Replace(host, "/graphql", "/health", 1)
	resp, err := http.Get(healthURL)
	if err != nil {
		return false
	}
	defer func() {
		_ = resp.Body.Close()
	}()
	return resp.StatusCode >= 200 && resp.StatusCode < 300
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

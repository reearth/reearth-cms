package user

import (
	"context"
	"errors"
	"testing"

	"github.com/hasura/go-graphql-client"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockGraphQLClient is a mock implementation of GraphQL client
type MockGraphQLClient struct {
	mock.Mock
}

func (m *MockGraphQLClient) Query(ctx context.Context, q any, variables map[string]any, options ...graphql.Option) error {
	args := m.Called(ctx, q, variables)
	return args.Error(0)
}

func (m *MockGraphQLClient) Mutate(ctx context.Context, q any, variables map[string]any, options ...graphql.Option) error {
	args := m.Called(ctx, q, variables)
	return args.Error(0)
}

func TestUserRepo_FindMe(t *testing.T) {
	tests := []struct {
		name           string
		setupMock      func(*MockGraphQLClient)
		expectedResult func(*testing.T, *user.User, error)
	}{
		{
			name: "successful query with complete user data",
			setupMock: func(client *MockGraphQLClient) {
				client.On("Query", mock.Anything, mock.AnythingOfType("*user.findMeQuery"), mock.Anything).
					Run(func(args mock.Arguments) {
						query := args.Get(1).(*findMeQuery)
						query.Me = gqlmodel.Me{
							ID:            graphql.ID("01k4w16cfenc9becdafja52swm"),
							Name:          graphql.String("John Doe"),
							Alias:         graphql.String("johndoe"),
							Email:         graphql.String("john@example.com"),
							Host:          graphql.String("example.com"),
							MyWorkspaceID: graphql.ID("01k4w1b0xap3ssvfq0we2b5p9j"),
							Auths:         []graphql.String{graphql.String("github"), graphql.String("google")},
							Metadata: gqlmodel.UserMetadata{
								Description: graphql.String("Test user description"),
								Lang:        graphql.String("en"),
								PhotoURL:    graphql.String("https://example.com/photo.jpg"),
								Theme:       graphql.String("dark"),
								Website:     graphql.String("https://johndoe.com"),
							},
							Workspaces: []gqlmodel.Workspace{
								{
									ID:       graphql.ID("01k4w1b0xap3ssvfq0we2b5p9j"),
									Name:     graphql.String("My Workspace"),
									Alias:    graphql.String("my-workspace"),
									Personal: true,
									Metadata: gqlmodel.WorkspaceMetadata{
										Description:  graphql.String("Personal workspace"),
										Website:      graphql.String("https://workspace.com"),
										Location:     graphql.String("Tokyo, Japan"),
										BillingEmail: graphql.String("billing@example.com"),
										PhotoURL:     graphql.String("https://example.com/workspace.jpg"),
									},
									Members: []gqlmodel.WorkspaceMember{},
								},
								{
									ID:       graphql.ID("01k4w1b0xap3ssvfq0wex9b55t"),
									Name:     graphql.String("Team Workspace"),
									Alias:    graphql.String("team-workspace"),
									Personal: false,
									Metadata: gqlmodel.WorkspaceMetadata{
										Description: graphql.String("Team workspace"),
									},
									Members: []gqlmodel.WorkspaceMember{},
								},
							},
						}
					}).
					Return(nil)
			},
			expectedResult: func(t *testing.T, result *user.User, err error) {
				assert.NoError(t, err)
				assert.NotNil(t, result)

				assert.Equal(t, "John Doe", result.Name())
				assert.Equal(t, "johndoe", result.Alias())
				assert.Equal(t, "john@example.com", result.Email())
				assert.NotNil(t, result.Host())
				assert.Equal(t, "example.com", *result.Host())
				assert.Equal(t, "01k4w1b0xap3ssvfq0we2b5p9j", result.MyWorkspaceID())
				assert.Equal(t, []string{"github", "google"}, result.Auths())

				// Check metadata
				metadata := result.Metadata()
				assert.NotNil(t, metadata)
				assert.Equal(t, "Test user description", metadata.Description())
				assert.Equal(t, "en", metadata.Lang().String())
				assert.Equal(t, "https://example.com/photo.jpg", metadata.PhotoURL())
				assert.Equal(t, "dark", metadata.Theme())
				assert.Equal(t, "https://johndoe.com", metadata.Website())

				// Check workspaces
				workspaces := result.Workspaces()
				assert.Len(t, workspaces, 2)

				// Check my workspace
				myWorkspace := result.MyWorkspace()
				assert.NotNil(t, myWorkspace)
				assert.Equal(t, "My Workspace", myWorkspace.Name())
				assert.Equal(t, "my-workspace", myWorkspace.Alias())
				assert.False(t, myWorkspace.Personal())
			},
		},
		{
			name: "successful query with minimal user data",
			setupMock: func(client *MockGraphQLClient) {
				client.On("Query", mock.Anything, mock.AnythingOfType("*user.findMeQuery"), mock.Anything).
					Run(func(args mock.Arguments) {
						query := args.Get(1).(*findMeQuery)
						query.Me = gqlmodel.Me{
							ID:            graphql.ID("01k4w16cfenc9becdafja52swm"),
							Name:          graphql.String("Jane Doe"),
							Email:         graphql.String("jane@example.com"),
							Host:          graphql.String(""),
							MyWorkspaceID: graphql.ID("01k4w1b0xap3ssvfq0we2b5p9j"),
							Metadata: gqlmodel.UserMetadata{
								Lang: graphql.String("ja"),
							},
							Workspaces: []gqlmodel.Workspace{},
						}
					}).
					Return(nil)
			},
			expectedResult: func(t *testing.T, result *user.User, err error) {
				assert.NoError(t, err)
				assert.NotNil(t, result)

				assert.Equal(t, "Jane Doe", result.Name())
				assert.Equal(t, "", result.Alias())
				assert.Equal(t, "jane@example.com", result.Email())
				assert.NotNil(t, result.Host())
				assert.Equal(t, "", *result.Host())
				assert.Equal(t, "01k4w1b0xap3ssvfq0we2b5p9j", result.MyWorkspaceID())
				assert.Equal(t, []string{}, result.Auths())

				// Check empty workspaces
				workspaces := result.Workspaces()
				assert.Len(t, workspaces, 0)

				// Check my workspace is empty (not found in workspaces list)
				myWorkspace := result.MyWorkspace()
				assert.True(t, myWorkspace.ID().IsEmpty())
			},
		},
		{
			name: "GraphQL query error",
			setupMock: func(client *MockGraphQLClient) {
				client.On("Query", mock.Anything, mock.AnythingOfType("*user.findMeQuery"), mock.Anything).
					Return(errors.New("GraphQL query failed"))
			},
			expectedResult: func(t *testing.T, result *user.User, err error) {
				assert.Error(t, err)
				assert.Nil(t, result)
				assert.Contains(t, err.Error(), "GraphQL query failed")
			},
		},
		{
			name: "invalid user ID error",
			setupMock: func(client *MockGraphQLClient) {
				client.On("Query", mock.Anything, mock.AnythingOfType("*user.findMeQuery"), mock.Anything).
					Run(func(args mock.Arguments) {
						query := args.Get(1).(*findMeQuery)
						query.Me = gqlmodel.Me{
							ID:            graphql.ID("invalid-id-format"),
							Name:          graphql.String("Test User"),
							Email:         graphql.String("test@example.com"),
							MyWorkspaceID: graphql.ID("01k4w1b0xap3ssvfq0we2b5p9j"),
							Metadata: gqlmodel.UserMetadata{
								Lang: graphql.String("en"),
							},
							Workspaces: []gqlmodel.Workspace{},
						}
					}).
					Return(nil)
			},
			expectedResult: func(t *testing.T, result *user.User, err error) {
				assert.Error(t, err)
				assert.Nil(t, result)
				assert.Contains(t, err.Error(), "invalid")
			},
		},
		{
			name: "successful query with my workspace found in workspaces list",
			setupMock: func(client *MockGraphQLClient) {
				client.On("Query", mock.Anything, mock.AnythingOfType("*user.findMeQuery"), mock.Anything).
					Run(func(args mock.Arguments) {
						query := args.Get(1).(*findMeQuery)
						query.Me = gqlmodel.Me{
							ID:            graphql.ID("01k4w16cfenc9becdafja52swm"),
							Name:          graphql.String("Alice Smith"),
							Email:         graphql.String("alice@example.com"),
							MyWorkspaceID: graphql.ID("01k4w1b0xap3ssvfq0wex9b55t"),
							Metadata: gqlmodel.UserMetadata{
								Lang: graphql.String("en"),
							},
							Workspaces: []gqlmodel.Workspace{
								{
									ID:       graphql.ID("01k4w1b0xap3ssvfq0we2b5p9j"),
									Name:     graphql.String("Other Workspace"),
									Alias:    graphql.String("other"),
									Personal: false,
									Metadata: gqlmodel.WorkspaceMetadata{},
									Members:  []gqlmodel.WorkspaceMember{},
								},
								{
									ID:       graphql.ID("01k4w1b0xap3ssvfq0wex9b55t"),
									Name:     graphql.String("Alice's Workspace"),
									Alias:    graphql.String("alice-workspace"),
									Personal: true,
									Metadata: gqlmodel.WorkspaceMetadata{
										Description: graphql.String("Alice's personal workspace"),
									},
									Members: []gqlmodel.WorkspaceMember{},
								},
							},
						}
					}).
					Return(nil)
			},
			expectedResult: func(t *testing.T, result *user.User, err error) {
				assert.NoError(t, err)
				assert.NotNil(t, result)

				assert.Equal(t, "Alice Smith", result.Name())
				assert.Equal(t, "alice@example.com", result.Email())
				assert.Equal(t, "01k4w1b0xap3ssvfq0wex9b55t", result.MyWorkspaceID())

				// Check workspaces
				workspaces := result.Workspaces()
				assert.Len(t, workspaces, 2)

				// Check my workspace is correctly set from workspaces list
				myWorkspace := result.MyWorkspace()
				assert.NotNil(t, myWorkspace)
				assert.Equal(t, "Alice's Workspace", myWorkspace.Name())
				assert.Equal(t, "alice-workspace", myWorkspace.Alias())
				assert.False(t, myWorkspace.Personal())
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			// Create mock client
			mockClient := new(MockGraphQLClient)
			tt.setupMock(mockClient)

			// Create repository with mock client
			repo := NewRepoWithClient(mockClient)

			// Execute FindMe
			ctx := context.Background()
			result, err := repo.FindMe(ctx)

			// Assert results
			tt.expectedResult(t, result, err)

			// Verify mock expectations
			mockClient.AssertExpectations(t)
		})
	}
}

func TestNewRepo(t *testing.T) {
	// Test with nil graphql.Client
	repo := NewRepo(nil)

	assert.NotNil(t, repo)
	assert.Nil(t, repo.client)
}

func TestNewRepoWithClient(t *testing.T) {
	// Test with mock GraphQL client
	mockClient := new(MockGraphQLClient)
	repo := NewRepoWithClient(mockClient)

	assert.NotNil(t, repo)
	assert.Equal(t, mockClient, repo.client)
}

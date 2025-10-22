package user

import (
	"context"

	"github.com/hasura/go-graphql-client"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/gql/util"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

// GraphQLClient interface for testability
type GraphQLClient interface {
	Query(ctx context.Context, q any, variables map[string]any, options ...graphql.Option) error
	Mutate(ctx context.Context, m any, variables map[string]any, options ...graphql.Option) error
}

type UserRepo struct {
	client GraphQLClient
}

func NewRepo(client *graphql.Client) *UserRepo {
	return &UserRepo{client: client}
}

// NewRepoWithClient creates a new UserRepo with the given GraphQLClient interface
func NewRepoWithClient(client GraphQLClient) *UserRepo {
	return &UserRepo{client: client}
}

func (r *UserRepo) FindMe(ctx context.Context) (*user.User, error) {
	var query findMeQuery

	if err := r.client.Query(ctx, &query, nil); err != nil {
		return nil, err
	}

	// Convert GraphQL ID to domain ID
	id, err := user.IDFrom(string(query.Me.ID))
	if err != nil {
		return nil, err
	}

	var wId user.WorkspaceID
	if query.Me.MyWorkspaceID != "" {
		var err error
		wId, err = user.WorkspaceIDFrom(string(query.Me.MyWorkspaceID))
		if err != nil {
			return nil, err
		}
	}

	// Build the user using the domain builder
	builder := user.New().
		ID(id).
		Name(string(query.Me.Name)).
		Alias(string(query.Me.Alias)).
		Email(string(query.Me.Email)).
		Metadata(util.ToUserMetadata(query.Me.Metadata)).
		Host(string(query.Me.Host)).
		MyWorkspaceID(wId).
		Auths(util.ToStringSlice(query.Me.Auths)).
		Workspaces(util.ToWorkspaces(query.Me.Workspaces))

	// Handle MyWorkspace if it exists in the workspaces list
	if len(query.Me.Workspaces) > 0 {
		for _, ws := range query.Me.Workspaces {
			if string(ws.ID) == string(query.Me.MyWorkspaceID) {
				if myWorkspace := util.ToWorkspace(ws); myWorkspace != nil {
					builder = builder.MyWorkspace(*myWorkspace)
				}
				break
			}
		}
	}

	return builder.MustBuild(), nil
}

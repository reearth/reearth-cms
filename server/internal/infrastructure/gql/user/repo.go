package user

import (
	"context"

	"github.com/hasura/go-graphql-client"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearthx/log"
)

type UserRepo struct {
	client *graphql.Client
}

func NewRepo(client *graphql.Client) *UserRepo {
	return &UserRepo{client: client}
}

func (r *UserRepo) FindMe(ctx context.Context) (*user.User, error) {
	// First, try a simple introspection query to test basic connectivity
	var introspectionQuery struct {
		Typename string `graphql:"__typename"`
	}
	
	log.Infof("External API: Testing basic connectivity with introspection query")
	if err := r.client.Query(ctx, &introspectionQuery, nil); err != nil {
		log.Errorf("External API: Basic connectivity failed - %v", err)
		log.Errorf("This likely means: 1) Wrong endpoint, 2) Authentication required, 3) Not a GraphQL API")
		return nil, err
	}
	log.Infof("External API: Basic connectivity successful")

	var query findMeQuery
	// Log the query structure for debugging
	log.Infof("External API: Making GraphQL query for 'me' with fields: id, name, email")

	if err := r.client.Query(ctx, &query, nil); err != nil {
		// Log more details about the GraphQL query failure
		log.Errorf("External GraphQL query failed - Error: %v", err)
		log.Errorf("This suggests the external API might: 1) Require authentication, 2) Have different field names, 3) Not support the 'me' query")
		return nil, err
	}

	// Convert GraphQL ID to domain ID
	id, err := user.IDFrom(string(query.Me.ID))
	if err != nil {
		return nil, err
	}

	// Build the user using the domain builder with simplified data
	// Use default/empty values for fields not available from external API
	builder := user.New().
		ID(id).
		Name(string(query.Me.Name)).
		Alias("").  // Not available from external API
		Email(string(query.Me.Email)).
		Metadata(user.NewMetadata().MustBuild()). // Empty metadata
		MyWorkspaceID("").
		Auths([]string{}) // Not available from external API

	return builder.MustBuild(), nil
}

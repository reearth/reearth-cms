package user

import "github.com/hasura/go-graphql-client"

// Ultra-simplified query structure for external API testing
type findMeQuery struct {
	Me struct {
		ID    graphql.ID     `graphql:"id"`
		Name  graphql.String `graphql:"name"`
		Email graphql.String `graphql:"email"`
	} `graphql:"me"`
}

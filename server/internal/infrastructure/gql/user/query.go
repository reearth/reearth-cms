package user

import "github.com/reearth/reearth-cms/server/internal/infrastructure/gql/gqlmodel"

type findMeQuery struct {
	Me gqlmodel.Me `graphql:"me"`
}

package gateway

import "github.com/reearth/reearth-cms/server/internal/infrastructure/gql"

type Container struct {
	Authenticator Authenticator
	File          File
	Mailer        Mailer
	PolicyChecker PolicyChecker
	TaskRunner    TaskRunner
	Account       *gql.Client
}

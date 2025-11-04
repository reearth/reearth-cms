package gateway

import (
	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
)

type Container struct {
	Authenticator Authenticator
	File          File
	Mailer        Mailer
	PolicyChecker PolicyChecker
	TaskRunner    TaskRunner
	AccountsAPI   *gqlclient.Client
}

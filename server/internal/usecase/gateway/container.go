package gateway

type Container struct {
	Authenticator Authenticator
	File          File
	Mailer        Mailer
	PolicyChecker PolicyChecker
	TaskRunner    TaskRunner
	Accounts      Account
	JobPubSub     JobPubSub
}

package gateway

type Container struct {
	Authenticator Authenticator
	File          File
	Mailer        Mailer
}

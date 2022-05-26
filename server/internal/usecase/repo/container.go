package repo

type Container struct {
	Lock        Lock
	User        User
	Transaction Transaction
	Workspace   Workspace
}

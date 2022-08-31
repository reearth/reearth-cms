package interfaces

import "errors"

type ListOperation string

const (
	ListOperationAdd    ListOperation = "add"
	ListOperationMove   ListOperation = "move"
	ListOperationRemove ListOperation = "remove"
)

var (
	ErrOperationDenied error = errors.New("operation denied")
	ErrFileNotIncluded error = errors.New("file not included")
)

type Container struct {
	Asset     Asset
	Workspace Workspace
	User      User
	Project   Project
	Model     Model
	Schema    Schema
}

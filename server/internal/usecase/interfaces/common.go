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
)

type Container struct {
	Asset     	Asset
	User        User
	Project     Project
	Model       Model
	Schema      Schema
	Integration Integration
}

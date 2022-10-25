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
	ErrInvalidOperator error = errors.New("invalid operator")
)

type Container struct {
	Asset       Asset
	Workspace   Workspace
	User        User
	Item        Item
	Project     Project
	Model       Model
	Schema      Schema
	Integration Integration
}

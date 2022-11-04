package interfaces

import (
	"context"
)

type Item struct {
	ID     string
	Fields map[string]any
}

type ListResult[T any] struct {
	Results    []T `json:"results"`
	TotalCount int `json:"totalCount"`
	Limit      int `json:"limit"`
	Offset     int `json:"offset"`
}

type PublicAPI interface {
	GetItem(context.Context, string, string) (Item, error)
	GetItems(context.Context, string, string) (ListResult[Item], error)
}

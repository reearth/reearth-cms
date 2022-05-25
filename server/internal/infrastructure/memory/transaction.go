package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
)

type Transaction struct{}

type Tx struct{}

func NewTransaction() *Transaction {
	return &Transaction{}
}

func (*Transaction) Begin() (repo.Tx, error) {
	return &Tx{}, nil
}
func (*Tx) Commit() {
	// do nothing
}
func (*Tx) End(_ context.Context) error {
	return nil
}

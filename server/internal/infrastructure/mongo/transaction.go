package mongo

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearthx/mongox"
)

type Transaction struct {
	client *mongox.Client
}

func NewTransaction(client *mongox.Client) repo.Transaction {
	return &Transaction{
		client: client,
	}
}

func (t *Transaction) Begin() (repo.Tx, error) {
	return t.client.BeginTransaction()
}

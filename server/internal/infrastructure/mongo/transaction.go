package mongo

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	mongodoc "github.com/reearth/reearthx/mongox"
)

type Transaction struct {
	client *mongodoc.Client
}

func NewTransaction(client *mongodoc.Client) repo.Transaction {
	return &Transaction{
		client: client,
	}
}

func (t *Transaction) Begin() (repo.Tx, error) {
	return t.client.BeginTransaction()
}

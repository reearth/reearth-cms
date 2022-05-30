package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
)

type Transaction struct {
	committed  int
	beginError error
	endError   error
}

type Tx struct {
	t         *Transaction
	committed bool
	endError  error
}

func NewTransaction() *Transaction {
	return &Transaction{}
}

func (t *Transaction) SetBeginError(err error) {
	t.beginError = err
}

func (t *Transaction) SetEndError(err error) {
	t.endError = err
}

func (t *Transaction) Committed() int {
	return t.committed
}

func (t *Transaction) Begin() (repo.Tx, error) {
	if t.beginError != nil {
		return nil, t.beginError
	}
	return &Tx{t: t, endError: t.endError}, nil
}

func (t *Tx) Commit() {
	t.committed = true
	if t.t != nil {
		t.t.committed++
	}
}

func (t *Tx) End(_ context.Context) error {
	return t.endError
}

func (t *Tx) IsCommitted() bool {
	return t.committed
}

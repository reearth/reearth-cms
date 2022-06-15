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
}

func (t *Tx) End(_ context.Context) error {
	if t.endError != nil {
		return t.endError
	}
	if t.committed && t.t != nil {
		t.t.committed++
	}
	return nil
}

func (t *Tx) IsCommitted() bool {
	return t.committed
}

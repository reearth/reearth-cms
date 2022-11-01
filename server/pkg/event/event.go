package event

import (
	"time"
)

type Type string

type Event[T any] struct {
	id        ID
	timestamp time.Time
	operator  Operator
	ty        Type
	object    T
}

func (e *Event[T]) ID() ID {
	return e.id
}

func (e *Event[T]) Type() Type {
	return e.ty
}

func (e *Event[T]) Timestamp() time.Time {
	return e.timestamp
}

func (e *Event[T]) Operator() Operator {
	return e.operator
}

func (e *Event[T]) Object() any {
	return e.object
}

func (e *Event[T]) Clone() *Event[T] {
	if e == nil {
		return nil
	}
	return &Event[T]{
		id:        e.id.Clone(),
		timestamp: e.timestamp,
		operator:  e.operator,
		ty:        e.ty,
		object:    e.object,
	}
}

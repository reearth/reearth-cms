package event

import "github.com/samber/lo"

type Builder[T any] struct {
	i *Event[T]
}

func New[T any]() *Builder[T] {
	return &Builder[T]{i: &Event[T]{}}
}

func (b *Builder[T]) Build() (*Event[T], error) {
	if b.i.id.IsNil() {
		return nil, ErrInvalidID
	}
	return b.i, nil
}

func (b *Builder[T]) MustBuild() *Event[T] {
	return lo.Must(b.Build())
}

//TODO: add method later

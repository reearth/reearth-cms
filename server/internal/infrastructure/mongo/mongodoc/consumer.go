package mongodoc

import "go.mongodb.org/mongo-driver/bson"

type Consumer interface {
	Consume(raw bson.Raw) error
}

type FuncConsumer func(raw bson.Raw) error

func (c FuncConsumer) Consume(raw bson.Raw) error {
	return c(raw)
}

type SimpleConsumer[T any] func(data T) error

func (s SimpleConsumer[T]) Consume(raw bson.Raw) error {
	var t T
	if err := bson.Unmarshal(raw, &t); err != nil {
		return err
	}
	return s(t)
}

type SliceConsumer[T any] struct {
	Result []T
	c      SimpleConsumer[T]
}

func (s *SliceConsumer[T]) Consume(raw bson.Raw) error {
	if s.c == nil {
		s.c = SimpleConsumer[T](func(data T) error {
			s.Result = append(s.Result, data)
			return nil
		})
	}
	return s.c.Consume(raw)
}

type SliceRawFuncConsumer[T any] struct {
	Result []T
	f      func(bson.Raw) (T, error)
}

func NewSliceRawFuncConsumer[T any](f func(t bson.Raw) (T, error)) *SliceRawFuncConsumer[T] {
	return &SliceRawFuncConsumer[T]{
		f: f,
	}
}

func (s *SliceRawFuncConsumer[T]) Consume(raw bson.Raw) error {
	data, err := s.f(raw)
	if err != nil {
		return err
	}
	s.Result = append(s.Result, data)
	return nil
}

type SliceFuncConsumer[T, K any] struct {
	Result []K
	c      SimpleConsumer[T]
}

func NewSliceFuncConsumer[T, K any](f func(t T) (K, error)) *SliceFuncConsumer[T, K] {
	var c *SliceFuncConsumer[T, K]
	c = &SliceFuncConsumer[T, K]{
		c: SimpleConsumer[T](func(d T) error {
			e, err := f(d)
			if err != nil {
				return err
			}
			c.Result = append(c.Result, e)
			return nil
		}),
	}
	return c
}

func (s *SliceFuncConsumer[T, K]) Consume(raw bson.Raw) error {
	return s.c.Consume(raw)
}

type BatchConsumer struct {
	Size     int
	Rows     []bson.Raw
	Callback func([]bson.Raw) error
}

func (c *BatchConsumer) Consume(raw bson.Raw) error {
	size := c.Size
	if size == 0 {
		size = 10
	}

	if raw != nil {
		c.Rows = append(c.Rows, raw)
	}

	if raw == nil || len(c.Rows) >= size {
		err := c.Callback(c.Rows)
		c.Rows = []bson.Raw{}
		if err != nil {
			return err
		}
	}

	return nil
}

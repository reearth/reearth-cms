package mongogit

import (
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"go.mongodb.org/mongo-driver/bson"
)

type Consumer interface {
	ConsumeWithVersion(raw bson.Raw, meta Meta) error
}

type FuncConsumer func(data bson.Raw, meta Meta) error

func (s FuncConsumer) ConsumeWithVersion(raw bson.Raw, meta Meta) error {
	return s(raw, metaFromRaw(raw))
}

type SimpleConsumer[T any] func(data T, meta Meta) error

func (s SimpleConsumer[T]) ConsumeWithVersion(raw bson.Raw, meta Meta) error {
	var t T
	if err := bson.Unmarshal(raw, &t); err != nil {
		return err
	}
	return s(t, metaFromRaw(raw))
}

type SliceConsumer[T any] struct {
	Result []DataAndMeta[T]
	c      SimpleConsumer[T]
}

func (s *SliceConsumer[T]) ConsumeWithVersion(raw bson.Raw, meta Meta) error {
	if s.c == nil {
		s.c = SimpleConsumer[T](func(data T, meta Meta) error {
			s.Result = append(s.Result, DataAndMeta[T]{Data: data, Meta: meta})
			return nil
		})
	}
	return s.c.ConsumeWithVersion(raw, meta)
}

type consumerAdapter struct {
	c Consumer
}

func (c *consumerAdapter) Consume(raw bson.Raw) error {
	return c.c.ConsumeWithVersion(raw, metaFromRaw(raw))
}

func consumer(c Consumer) mongodoc.Consumer {
	return &consumerAdapter{c: c}
}

type DataAndMeta[T any] struct {
	Data T
	Meta Meta
}

func dataAndMetaFromRaw[T any](r bson.Raw) (DataAndMeta[T], error) {
	var data T
	if err := bson.Unmarshal(r, &data); err != nil {
		return DataAndMeta[T]{}, err
	}
	return DataAndMeta[T]{
		Data: data,
		Meta: metaFromRaw(r),
	}, nil
}

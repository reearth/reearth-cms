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

const (
	versionKey         = "__v"
	previousVersionKey = "__w"
	refKey             = "__refs"
)

type Meta struct {
	Version         Version `json:"__v" bson:"__v"`
	PreviousVersion Version `json:"__w" bson:"__w"`
	Ref             []Ref   `json:"__refs" bson:"__refs"`
}

func metaFromRaw(r bson.Raw) Meta {
	m := Meta{}
	_ = bson.Unmarshal(r, &m)
	return m
}

type DataAndMeta[T any] struct {
	Data T
	Meta Meta
}

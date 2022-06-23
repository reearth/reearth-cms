package mongogit

import (
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"go.mongodb.org/mongo-driver/bson"
)

type Consumer interface {
	ConsumeWithVersion(raw bson.Raw, version Version) error
}

type FuncConsumer func(data bson.Raw, version Version) error

func (s FuncConsumer) ConsumeWithVersion(raw bson.Raw, version Version) error {
	return s(raw, versionFromRaw(raw))
}

type SimpleConsumer[T any] func(data T, version Version) error

func (s SimpleConsumer[T]) ConsumeWithVersion(raw bson.Raw, version Version) error {
	var t T
	if err := bson.Unmarshal(raw, &t); err != nil {
		return err
	}
	return s(t, versionFromRaw(raw))
}

type consumerAdapter struct {
	c Consumer
}

func (c *consumerAdapter) Consume(raw bson.Raw) error {
	return c.c.ConsumeWithVersion(raw, versionFromRaw(raw))
}

func consumer(c Consumer) mongodoc.Consumer {
	return &consumerAdapter{c: c}
}

const versionkey = "__v"

type versioned struct {
	Version Version `json:"__v" bson:"__v"`
}

func versionFromRaw(r bson.Raw) Version {
	v := versioned{}
	_ = bson.Unmarshal(r, &v)
	return v.Version
}

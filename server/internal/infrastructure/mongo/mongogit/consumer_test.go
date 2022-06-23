package mongogit

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestFuncConsumer(t *testing.T) {
	err := errors.New("aaa")
	raw, _ := bson.Marshal(map[string]any{versionkey: Version("x"), "test": "hoge"})

	called := 0
	c := FuncConsumer(func(r bson.Raw, v Version) error {
		assert.Equal(t, bson.Raw(raw), r)
		assert.Equal(t, Version("x"), v)
		called++
		return err
	})
	assert.Same(t, err, consumer(c).Consume(raw))
	assert.Equal(t, 1, called)
}

func TestSimpleConsumer(t *testing.T) {
	type d struct{ Test string }
	err := errors.New("aaa")
	raw, _ := bson.Marshal(map[string]any{versionkey: Version("x"), "test": "hoge"})

	called := 0
	c := SimpleConsumer[d](func(e d, v Version) error {
		assert.Equal(t, d{Test: "hoge"}, e)
		assert.Equal(t, Version("x"), v)
		called++
		return err
	})
	assert.Same(t, err, consumer(c).Consume(raw))
	assert.Equal(t, 1, called)
}

func TestVersionFromRaw(t *testing.T) {
	raw, _ := bson.Marshal(map[string]any{versionkey: Version("x"), "test": "hoge"})
	assert.Equal(t, Version("x"), versionFromRaw(raw))
}

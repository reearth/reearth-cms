package mongodoc

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

var _ Consumer = FuncConsumer(nil)

func TestFuncConsumer(t *testing.T) {
	err := errors.New("aaa")
	raw, _ := bson.Marshal(map[string]any{
		"test": "hoge",
	})

	called := 0
	c := FuncConsumer(func(r bson.Raw) error {
		assert.Equal(t, bson.Raw(raw), r)
		called++
		return err
	})
	assert.Same(t, err, c.Consume(raw))
	assert.Equal(t, 1, called)
}

func TestSimpleConsumer(t *testing.T) {
	type d struct{ Test string }
	err := errors.New("aaa")
	raw, _ := bson.Marshal(map[string]any{
		"test": "hoge",
	})

	called := 0
	c := SimpleConsumer[d](func(e d) error {
		assert.Equal(t, d{Test: "hoge"}, e)
		called++
		return err
	})
	assert.Same(t, err, c.Consume(raw))
	assert.Equal(t, 1, called)
}

func TestSliceConsumer(t *testing.T) {
	type d struct{ Test string }
	raw, _ := bson.Marshal(map[string]any{
		"test": "hoge",
	})

	c := &SliceConsumer[d]{}
	assert.NoError(t, c.Consume(raw))
	assert.Equal(t, []d{{
		Test: "hoge",
	},
	}, c.Result)
}

func TestSliceRawFuncConsumer(t *testing.T) {
	type d struct{ Test string }
	raw, _ := bson.Marshal(map[string]any{
		"test": "hoge",
	})
	c := NewSliceRawFuncConsumer(func(r bson.Raw) (string, error) {
		var d2 d
		if err := bson.Unmarshal(r, &d2); err != nil {
			return "", err
		}
		return d2.Test, nil
	})
	assert.NoError(t, c.Consume(raw))
	assert.Equal(t, []string{"hoge"}, c.Result)
}

func TestSliceFuncConsumer(t *testing.T) {
	type d struct{ Test string }
	raw, _ := bson.Marshal(map[string]any{
		"test": "hoge",
	})
	c := NewSliceFuncConsumer(func(d d) (string, error) {
		return d.Test, nil
	})
	assert.NoError(t, c.Consume(raw))
	assert.Equal(t, []string{"hoge"}, c.Result)
}

func TestBatchConsumer(t *testing.T) {
	c := &BatchConsumer{
		Size: 10,
		Callback: func(r []bson.Raw) error {
			assert.Equal(t, []bson.Raw{[]byte{0}, []byte{1}, []byte{2}, []byte{3}, []byte{4}}, r)
			return nil
		},
	}

	for i := 0; i < 5; i++ {
		r := bson.Raw([]byte{byte(i)})
		assert.Nil(t, c.Consume(r))
	}
	assert.Nil(t, c.Consume(nil))
}

func TestBatchConsumerWithManyRows(t *testing.T) {
	counter := 0
	c := &BatchConsumer{
		Size: 1,
		Callback: func(r []bson.Raw) error {
			if counter >= 5 {
				assert.Equal(t, []bson.Raw{}, r)
				return nil
			}
			assert.Equal(t, []bson.Raw{[]byte{byte(counter)}}, r)
			counter++
			return nil
		},
	}

	for i := 0; i < 5; i++ {
		r := bson.Raw([]byte{byte(i)})
		assert.Nil(t, c.Consume(r))
	}
	assert.Nil(t, c.Consume(nil))
}

func TestBatchConsumerWithError(t *testing.T) {
	c := &BatchConsumer{
		Size: 1,
		Callback: func(r []bson.Raw) error {
			return errors.New("hoge")
		},
	}

	assert.EqualError(t, c.Consume(nil), "hoge")
}

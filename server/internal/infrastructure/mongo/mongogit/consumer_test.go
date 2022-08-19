package mongogit

import (
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestFuncConsumer(t *testing.T) {
	err := errors.New("aaa")
	raw, _ := bson.Marshal(map[string]any{
		versionKey:         version.Version("x"),
		previousVersionKey: version.Version("y"),
		refKey:             []version.Ref{"main"},
		"test":             "hoge",
	})

	called := 0
	c := FuncConsumer(func(r bson.Raw, m Meta) error {
		assert.Equal(t, bson.Raw(raw), r)
		assert.Equal(t, Meta{
			Version:         version.Version("x"),
			PreviousVersion: version.Version("y"),
			Ref:             []version.Ref{"main"},
		}, m)
		called++
		return err
	})
	assert.Same(t, err, consumer(c).Consume(raw))
	assert.Equal(t, 1, called)
}

func TestSimpleConsumer(t *testing.T) {
	type d struct{ Test string }
	err := errors.New("aaa")
	raw, _ := bson.Marshal(map[string]any{
		versionKey:         version.Version("x"),
		previousVersionKey: version.Version("y"),
		refKey:             []version.Ref{"main"},
		"test":             "hoge",
	})

	called := 0
	c := SimpleConsumer[d](func(e d, m Meta) error {
		assert.Equal(t, d{Test: "hoge"}, e)
		assert.Equal(t, Meta{
			Version:         version.Version("x"),
			PreviousVersion: version.Version("y"),
			Ref:             []version.Ref{"main"},
		}, m)
		called++
		return err
	})
	assert.Same(t, err, consumer(c).Consume(raw))
	assert.Equal(t, 1, called)
}

func TestSliceConsumer(t *testing.T) {
	type d struct{ Test string }
	raw, _ := bson.Marshal(map[string]any{
		versionKey:         version.Version("x"),
		previousVersionKey: version.Version("y"),
		refKey:             []version.Ref{"main"},
		"test":             "hoge",
	})

	c := &SliceConsumer[d]{}
	assert.NoError(t, consumer(c).Consume(raw))
	assert.Equal(t, []DataAndMeta[d]{
		{
			Data: d{
				Test: "hoge",
			},
			Meta: Meta{
				Version:         version.Version("x"),
				PreviousVersion: version.Version("y"),
				Ref:             []version.Ref{"main"},
			},
		},
	}, c.Result)
}

func TestVersionFromRaw(t *testing.T) {
	raw, _ := bson.Marshal(map[string]any{
		versionKey:         version.Version("x"),
		previousVersionKey: version.Version("y"),
		refKey:             []version.Ref{"main"},
		"test":             "hoge",
	})
	assert.Equal(t, Meta{
		Version:         version.Version("x"),
		PreviousVersion: version.Version("y"),
		Ref:             []version.Ref{"main"},
	}, metaFromRaw(raw))

	raw, _ = bson.Marshal(map[string]any{
		versionKey: version.Version("x"),
		"test":     "hoge",
	})
	assert.Equal(t, Meta{
		Version:         version.Version("x"),
		PreviousVersion: version.VersionZero,
		Ref:             nil,
	}, metaFromRaw(raw))
}

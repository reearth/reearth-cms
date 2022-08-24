package mongogit

import (
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestFuncConsumer(t *testing.T) {
	vx, vy := version.New(), version.New()
	err := errors.New("aaa")
	raw, _ := bson.Marshal(map[string]any{
		versionKey: vx,
		parentsKey: []version.Version{vy},
		refsKey:    []version.Ref{"main"},
		"test":     "hoge",
	})

	called := 0
	c := FuncConsumer(func(r bson.Raw, m Meta) error {
		assert.Equal(t, bson.Raw(raw), r)
		assert.Equal(t, Meta{
			Version: vx,
			Parents: []version.Version{vy},
			Refs:    []version.Ref{"main"},
		}, m)
		called++
		return err
	})
	assert.Same(t, err, consumer(c).Consume(raw))
	assert.Equal(t, 1, called)
}

func TestSimpleConsumer(t *testing.T) {
	vx, vy := version.New(), version.New()
	type d struct{ Test string }
	err := errors.New("aaa")
	raw, _ := bson.Marshal(map[string]any{
		versionKey: vx,
		parentsKey: []version.Version{vy},
		refsKey:    []version.Ref{"main"},
		"test":     "hoge",
	})

	called := 0
	c := SimpleConsumer[d](func(e d, m Meta) error {
		assert.Equal(t, d{Test: "hoge"}, e)
		assert.Equal(t, Meta{
			Version: vx,
			Parents: []version.Version{vy},
			Refs:    []version.Ref{"main"},
		}, m)
		called++
		return err
	})
	assert.Same(t, err, consumer(c).Consume(raw))
	assert.Equal(t, 1, called)
}

func TestSliceConsumer(t *testing.T) {
	vx, vy := version.New(), version.New()
	type d struct{ Test string }
	raw, _ := bson.Marshal(map[string]any{
		versionKey: vx,
		parentsKey: []version.Version{vy},
		refsKey:    []version.Ref{"main"},
		"test":     "hoge",
	})

	c := &SliceConsumer[d]{}
	assert.NoError(t, consumer(c).Consume(raw))
	assert.Equal(t, []DataAndMeta[d]{
		{
			Data: d{
				Test: "hoge",
			},
			Meta: Meta{
				Version: vx,
				Parents: []version.Version{vy},
				Refs:    []version.Ref{"main"},
			},
		},
	}, c.Result)
}

func TestVersionFromRaw(t *testing.T) {
	vx, vy := version.New(), version.New()
	raw, _ := bson.Marshal(map[string]any{
		versionKey: vx,
		parentsKey: []version.Version{vy},
		refsKey:    []version.Ref{"main"},
		"test":     "hoge",
	})
	assert.Equal(t, Meta{
		Version: vx,
		Parents: []version.Version{vy},
		Refs:    []version.Ref{"main"},
	}, metaFromRaw(raw))

	raw, _ = bson.Marshal(map[string]any{
		versionKey: vx,
		"test":     "hoge",
	})
	assert.Equal(t, Meta{
		Version: vx,
		Refs:    nil,
	}, metaFromRaw(raw))
}

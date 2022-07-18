package key

import (
	"regexp"

	"github.com/goombaio/namegenerator"
	"github.com/reearth/reearth-cms/server/pkg/util"
)

var keyRegexp = regexp.MustCompile("^[a-zA-Z0-9_-]{5,32}$")

type Key struct {
	key string
}

func NewKey(key string) Key {
	if !keyRegexp.MatchString(key) {
		return Key{}
	}
	return Key{key}
}

func RandomKey() Key {
	seed := util.Now().UTC().UnixNano()
	return NewKey(namegenerator.NewNameGenerator(seed).Generate())
}

func (k Key) IsValid() bool {
	return k.key != ""
}

func (k Key) String() string {
	return k.key
}

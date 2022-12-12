package key

import (
	"regexp"

	"github.com/goombaio/namegenerator"
	"github.com/reearth/reearthx/util"
)

var keyRegexp = regexp.MustCompile("^[a-zA-Z0-9_-]{1,32}$")

type Key struct {
	key string
}

func New(key string) Key {
	if !keyRegexp.MatchString(key) {
		return Key{}
	}
	return Key{key}
}

func Random() Key {
	seed := util.Now().UTC().UnixNano()
	return New(namegenerator.NewNameGenerator(seed).Generate())
}

func (k Key) IsValid() bool {
	return k.key != "" && k.key != "id"
}

func (k Key) String() string {
	return k.key
}

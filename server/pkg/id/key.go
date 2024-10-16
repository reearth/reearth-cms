package id

import (
	"regexp"
	"slices"

	"github.com/goombaio/namegenerator"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

var ErrInvalidKey = rerror.NewE(i18n.T("invalid key"))

var ErrDuplicatedKey = rerror.NewE(i18n.T("duplicated key"))

var keyRegexp = regexp.MustCompile("^[a-zA-Z0-9_-]{1,32}$")

var ngKeys = []string{"id"}

type Key struct {
	key string
}

func NewKey(key string) Key {
	k := Key{key}
	return k
}

func NewKeyFromPtr(key *string) *Key {
	return lo.ToPtr(NewKey(lo.FromPtr(key)))
}

func RandomKey() Key {
	seed := util.Now().UTC().UnixNano()
	return NewKey(namegenerator.NewNameGenerator(seed).Generate())
}

func (k Key) IsValid() bool {
	return k.key != "" && !slices.Contains(ngKeys, k.key) // && !strings.HasPrefix(k.key, "_") && !strings.HasPrefix(k.key, "-")
}

func (k Key) IsURLCompatible() bool {
	return k.IsValid() && keyRegexp.MatchString(k.key)
}

func (k Key) Ref() *Key {
	return &k
}

func (k Key) String() string {
	return k.key
}

func (k *Key) StringRef() *string {
	if k == nil {
		return nil
	}
	return lo.ToPtr(k.key)
}

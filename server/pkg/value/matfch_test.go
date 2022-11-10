package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMatch(t *testing.T) {
	var res any
	(&Value{t: TypeText, v: "aaa"}).Match(Match{Text: func(v string) { res = v }})
	assert.Equal(t, "aaa", res)

	res = nil
	(&Value{t: TypeBool, v: true}).Match(Match{Text: func(v string) { res = v }})
	assert.Nil(t, res)

	res = nil
	(&Value{t: TypeBool}).Match(Match{Nil: func(t Type) { res = t }})
	assert.Equal(t, TypeBool, res)

	res = nil
	(&Value{t: TypeBool}).Match(Match{Default: func() { res = "default" }})
	assert.Equal(t, "default", res)
}

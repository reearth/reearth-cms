package decompressor

import (
	"io"
)

type file interface {
	name() string
	open() (io.ReadCloser, error)
	skip() bool
}

type archive interface {
	files() []file
}

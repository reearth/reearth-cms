package decompressor

import (
	"io"
)

type file interface {
	name() string
	open() (io.ReadCloser, error)
	skip() bool
	size() uint64
}

type archive interface {
	files() []file
}

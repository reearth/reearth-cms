package utils

import (
	"bytes"
	"io"
)

type ReplayReader struct {
	Partial io.Reader // You read a bit from this
	Full    io.Reader // Reconstructed full stream: [what you read] + [rest]
}

func NewReplyReader(r io.Reader) *ReplayReader {
	var buf bytes.Buffer
	tee := io.TeeReader(r, &buf)

	return &ReplayReader{
		Partial: tee,
		Full:    io.MultiReader(&buf, r),
	}
}

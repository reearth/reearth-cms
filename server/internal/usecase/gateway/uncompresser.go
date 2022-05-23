package gateway

import "io"

type FileType string

var (
	Zip = FileType("zip")
	Tar = FileType("tar")
)

type Uncompresser interface {
	Uncompress(reader1 io.Reader, fType FileType) (reader2 io.Reader, err error)
}

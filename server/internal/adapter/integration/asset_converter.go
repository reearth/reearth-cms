package integration

import (
	"bytes"
	"errors"
	"io"
	"mime/multipart"

	"github.com/reearth/reearth-cms/server/pkg/file"
)

func toFile(multipartReader *multipart.Reader) (*file.File, error) {
	for {
		p, err := multipartReader.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		if p.FormName() != "file" {
			if err := p.Close(); err != nil {
				return nil, err
			}
			continue
		}

		buf := new(bytes.Buffer)
		s, err := buf.ReadFrom(p)
		if err != nil {
			return nil, err
		}

		return &file.File{
			Content:     io.NopCloser(buf),
			Path:        p.FileName(),
			Size:        s,
			ContentType: p.Header.Get("Content-Type"),
		}, nil
	}
	return nil, errors.New("file not found")
}

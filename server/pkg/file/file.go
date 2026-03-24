package file

import (
	"context"
	"errors"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"net/http"
	"net/url"
	"path"
	"strconv"

	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

type File struct {
	Content         io.ReadCloser
	Name            string
	Size            int64
	ContentType     string
	ContentEncoding string
}

func FromMultipart(multipartReader *multipart.Reader, formName string) (*File, error) {
	if formName == "" {
		formName = "file"
	}

	for {
		p, err := multipartReader.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		if p.FormName() != formName {
			if err := p.Close(); err != nil {
				return nil, err
			}
			continue
		}

		return &File{
			Content:     p,
			Name:        p.FileName(),
			Size:        0,
			ContentType: p.Header.Get("Content-Type"),
		}, nil
	}

	return nil, rerror.NewE(i18n.T("file not found"))
}

func FromURL(ctx context.Context, rawURL string) (*File, error) {
	URL, err := url.Parse(rawURL)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, URL.String(), nil)
	if err != nil {
		return nil, errors.New("failed to request")
	}

	// TODO: support gzip
	// req.Header.Set("Accept-Encoding", "gzip")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	if res.StatusCode > 300 {
		return nil, rerror.ErrInternalBy(fmt.Errorf("status code is %d", res.StatusCode))
	}

	ct := res.Header.Get("Content-Type")
	ce := res.Header.Get("Content-Encoding")
	if ce != "" && ce != "gzip" {
		return nil, fmt.Errorf("unsupported content encoding: %s", ce)
	}
	fs, _ := strconv.ParseInt(res.Header.Get("Content-Length"), 10, 64)

	fn := path.Base(URL.Path)
	_, m, err := mime.ParseMediaType(res.Header.Get("Content-Disposition"))
	if err == nil && m["filename"] != "" {
		fn = m["filename"]
	}

	return &File{
		Content:         res.Body,
		Name:            fn,
		ContentType:     ct,
		ContentEncoding: ce,
		Size:            fs,
	}, nil
}

package asset

import (
	"time"
)

type Upload struct {
	uuid            string
	project         ProjectID
	fileName        string
	expiresAt       time.Time
	contentLength   int64
	contentType     string
	contentEncoding string
	serve           bool
}

func (u *Upload) UUID() string {
	return u.uuid
}

func (u *Upload) Project() ProjectID {
	return u.project
}

func (u *Upload) FileName() string {
	return u.fileName
}

func (u *Upload) ExpiresAt() time.Time {
	return u.expiresAt
}

func (u *Upload) Expired(t time.Time) bool {
	return t.After(u.expiresAt)
}

func (u *Upload) ContentLength() int64 {
	return u.contentLength
}

func (u *Upload) ContentType() string {
	return u.contentType
}

func (u *Upload) ContentEncoding() string {
	return u.contentEncoding
}

// StoredInServe reports whether the upload was issued by reearth-serve, in
// which case UUID is the reearth-serve upload session ID.
func (u *Upload) StoredInServe() bool {
	return u.serve
}

func (u *Upload) Clone() *Upload {
	if u == nil {
		return nil
	}
	c := *u
	return &c
}

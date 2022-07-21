package asset

import (
	"time"
)

type File struct {
	name         string
	size         uint64
	contentType  string
	uploadedAt   time.Time
	uploadedById UserID
	path         string
	children     []*File
}

func (f *File) Name() string {
	return f.name
}

func (f *File) Size() uint64 {
	return f.size
}

func (f *File) ContentType() string {
	return f.contentType
}

func (f *File) UploadedAt() time.Time {
	return f.uploadedAt
}

func (f *File) UploadedByID() UserID {
	return f.uploadedById
}

func (f *File) Path() string {
	return f.path
}

func (f *File) Children() []*File {
	if f == nil {
		return nil
	}
	return f.children
}

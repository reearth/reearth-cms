package asset

import (
	"path"
	"time"

	"github.com/reearth/reearthx/util"
)

type Asset struct {
	id          ID
	project     ProjectID
	createdAt   time.Time
	user        *UserID
	integration *IntegrationID
	fileName    string
	size        uint64
	previewType *PreviewType
	file        *File
	uuid        string
	thread      ThreadID
}

type URLResolver = func(*Asset) string

func (a *Asset) ID() ID {
	return a.id
}

func (a *Asset) Project() ProjectID {
	return a.project
}

func (a *Asset) CreatedAt() time.Time {
	if a == nil {
		return time.Time{}
	}

	return a.createdAt
}

func (a *Asset) User() *UserID {
	return a.user
}

func (a *Asset) Integration() *IntegrationID {
	return a.integration
}

func (a *Asset) FileName() string {
	return a.fileName
}

func (a *Asset) Size() uint64 {
	return a.size
}

func (a *Asset) PreviewType() *PreviewType {
	if a.previewType == nil {
		return nil
	}
	return a.previewType
}

func (a *Asset) File() *File {
	return a.file
}

func (a *Asset) UUID() string {
	return a.uuid
}

func (a *Asset) RootPath() string {
	return path.Join(a.uuid[:2], a.uuid[2:], a.file.path)
}

func (a *Asset) UpdatePreviewType(p *PreviewType) {
	a.previewType = util.CloneRef(p)
}

func (a *Asset) Clone() *Asset {
	if a == nil {
		return nil
	}

	return &Asset{
		id:          a.id.Clone(),
		project:     a.project.Clone(),
		createdAt:   a.createdAt,
		user:        a.user.CloneRef(),
		integration: a.integration.CloneRef(),
		fileName:    a.fileName,
		size:        a.size,
		previewType: a.previewType,
		file:        a.file,
		uuid:        a.uuid,
		thread:      a.thread.Clone(),
	}
}

func (a *Asset) Thread() ThreadID {
	return a.thread
}

func (a *Asset) SetFile(f *File) {
	a.file = f
}

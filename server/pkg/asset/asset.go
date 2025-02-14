package asset

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
)

type Asset struct {
	id                      ID
	project                 ProjectID
	createdAt               time.Time
	user                    *accountdomain.UserID
	integration             *IntegrationID
	fileName                string
	size                    uint64
	previewType             *PreviewType
	uuid                    string
	thread                  *ThreadID
	archiveExtractionStatus *ArchiveExtractionStatus
	flatFiles               bool
}

type URLResolver = func(*Asset) string

// getters

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

func (a *Asset) User() *accountdomain.UserID {
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

func (a *Asset) UUID() string {
	return a.uuid
}

func (a *Asset) ArchiveExtractionStatus() *ArchiveExtractionStatus {
	if a.archiveExtractionStatus == nil {
		return nil
	}
	return a.archiveExtractionStatus
}

func (a *Asset) Thread() *ThreadID {
	return a.thread
}

func (a *Asset) FlatFiles() bool {
	return a.flatFiles
}

// setters

func (a *Asset) UpdatePreviewType(p *PreviewType) {
	a.previewType = util.CloneRef(p)
}

func (a *Asset) SetThread(thid *id.ThreadID) {
	a.thread = thid
}

func (a *Asset) UpdateArchiveExtractionStatus(s *ArchiveExtractionStatus) {
	a.archiveExtractionStatus = util.CloneRef(s)
}

// methods

func (a *Asset) Clone() *Asset {
	if a == nil {
		return nil
	}

	return &Asset{
		id:                      a.id.Clone(),
		project:                 a.project.Clone(),
		createdAt:               a.createdAt,
		user:                    a.user.CloneRef(),
		integration:             a.integration.CloneRef(),
		fileName:                a.fileName,
		size:                    a.size,
		previewType:             a.previewType,
		uuid:                    a.uuid,
		thread:                  a.thread.CloneRef(),
		archiveExtractionStatus: a.archiveExtractionStatus,
		flatFiles:               a.flatFiles,
	}
}

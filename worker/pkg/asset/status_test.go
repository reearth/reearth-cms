package asset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestArchiveExtractionStatusFrom(t *testing.T) {
	s := ArchiveExtractionStatusPending
	res, ok := ArchiveExtractionStatusFrom("pending")
	assert.Equal(t, s, res)
	assert.True(t, ok)

	s = ArchiveExtractionStatusPending
	res, ok = ArchiveExtractionStatusFrom("PENDING")
	assert.Equal(t, s, res)
	assert.True(t, ok)

	s = ArchiveExtractionStatusInProgress
	res, ok = ArchiveExtractionStatusFrom("in_progress")
	assert.Equal(t, s, res)
	assert.True(t, ok)

	s = ArchiveExtractionStatusDone
	res, ok = ArchiveExtractionStatusFrom("done")
	assert.Equal(t, s, res)
	assert.True(t, ok)

	s = ArchiveExtractionStatusFailed
	res, ok = ArchiveExtractionStatusFrom("failed")
	assert.Equal(t, s, res)
	assert.True(t, ok)

	s = ArchiveExtractionStatus("")
	res, ok = ArchiveExtractionStatusFrom("")
	assert.Equal(t, s, res)
	assert.False(t, ok)
}

func TestArchiveExtractionStatusFromRef(t *testing.T) {
	p := ArchiveExtractionStatusPending
	ip := ArchiveExtractionStatusInProgress
	d := ArchiveExtractionStatusDone
	f := ArchiveExtractionStatusFailed

	s := new("pending")
	res := ArchiveExtractionStatusFromRef(s)
	assert.Equal(t, &p, res)

	s = new("PENDING")
	res = ArchiveExtractionStatusFromRef(s)
	assert.Equal(t, &p, res)

	s = new("in_progress")
	res = ArchiveExtractionStatusFromRef(s)
	assert.Equal(t, &ip, res)

	s = new("done")
	res = ArchiveExtractionStatusFromRef(s)
	assert.Equal(t, &d, res)

	s = new("failed")
	res = ArchiveExtractionStatusFromRef(s)
	assert.Equal(t, &f, res)

	s = nil
	res = ArchiveExtractionStatusFromRef(s)
	assert.Nil(t, res)
}

func TestStatus_String(t *testing.T) {
	s := "pending"
	st := ArchiveExtractionStatusPending
	assert.Equal(t, s, st.String())
}

func TestStatus_StringRef(t *testing.T) {
	var st1 *ArchiveExtractionStatus
	assert.Nil(t, st1.StringRef())

	st2 := new(ArchiveExtractionStatusPending)
	s := new("pending")
	assert.Equal(t, s, st2.StringRef())
}

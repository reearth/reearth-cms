package asset

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestStatus_StatusFrom(t *testing.T) {
	tests := []struct {
		Name     string
		Expected struct {
			TA   ArchiveExtractionStatus
			Bool bool
		}
	}{
		{
			Name: "pending",
			Expected: struct {
				TA   ArchiveExtractionStatus
				Bool bool
			}{
				TA:   ArchiveExtractionStatusPending,
				Bool: true,
			},
		},
		{
			Name: "PENDING",
			Expected: struct {
				TA   ArchiveExtractionStatus
				Bool bool
			}{
				TA:   ArchiveExtractionStatusPending,
				Bool: true,
			},
		},
		{
			Name: "in_progress",
			Expected: struct {
				TA   ArchiveExtractionStatus
				Bool bool
			}{
				TA:   ArchiveExtractionStatusInProgress,
				Bool: true,
			},
		},
		{
			Name: "done",
			Expected: struct {
				TA   ArchiveExtractionStatus
				Bool bool
			}{
				TA:   ArchiveExtractionStatusDone,
				Bool: true,
			},
		},
		{
			Name: "failed",
			Expected: struct {
				TA   ArchiveExtractionStatus
				Bool bool
			}{
				TA:   ArchiveExtractionStatusFailed,
				Bool: true,
			},
		},
		{
			Name: "undefined",
			Expected: struct {
				TA   ArchiveExtractionStatus
				Bool bool
			}{
				TA:   ArchiveExtractionStatus(""),
				Bool: false,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res, ok := StatusFrom(tc.Name)
			assert.Equal(t, tc.Expected.TA, res)
			assert.Equal(t, tc.Expected.Bool, ok)
		})
	}
}

func TestStatus_StatusFromRef(t *testing.T) {
	p := ArchiveExtractionStatusPending
	ip := ArchiveExtractionStatusInProgress
	d := ArchiveExtractionStatusDone
	f := ArchiveExtractionStatusFailed

	tests := []struct {
		Name     string
		Input    *string
		Expected *ArchiveExtractionStatus
	}{
		{
			Name:     "pending",
			Input:    lo.ToPtr("pending"),
			Expected: &p,
		},
		{
			Name:     "upper case pending",
			Input:    lo.ToPtr("PENDING"),
			Expected: &p,
		},
		{
			Name:     "in progress",
			Input:    lo.ToPtr("in_progress"),
			Expected: &ip,
		},
		{
			Name:     "done",
			Input:    lo.ToPtr("done"),
			Expected: &d,
		},
		{
			Name:     "failed",
			Input:    lo.ToPtr("failed"),
			Expected: &f,
		},
		{
			Name: "nil input",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := StatusFromRef(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestStatus_String(t *testing.T) {
	s := "pending"
	st := ArchiveExtractionStatusPending
	assert.Equal(t, s, st.String())
}

func TestStatus_StringRef(t *testing.T) {
	var st1 *ArchiveExtractionStatus
	var st2 *ArchiveExtractionStatus = lo.ToPtr(ArchiveExtractionStatusPending)
	s := string(*st2)

	tests := []struct {
		Name     string
		Input    *string
		Expected *string
	}{
		{
			Name:     "nil Status pointer",
			Input:    st1.StringRef(),
			Expected: nil,
		},
		{
			Name:     "Status pointer",
			Input:    st2.StringRef(),
			Expected: &s,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.Input)
		})
	}
}

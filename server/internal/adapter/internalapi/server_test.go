package internalapi

import (
	"errors"
	"fmt"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func TestWithCode(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		wantCode codes.Code
		wantMsg  string
	}{
		{
			name:     "alias already used",
			err:      interfaces.ErrProjectAliasAlreadyUsed,
			wantCode: codes.AlreadyExists,
			wantMsg:  "project alias is already used by another project",
		},
		{
			name:     "invalid alias",
			err:      project.ErrInvalidAlias,
			wantCode: codes.InvalidArgument,
			wantMsg:  "invalid alias",
		},
		{
			name:     "operation denied",
			err:      interfaces.ErrOperationDenied,
			wantCode: codes.PermissionDenied,
			wantMsg:  "operation denied",
		},
		{
			name:     "wrapped creation limit exceeded",
			err:      fmt.Errorf("create: %w", interfaces.ErrProjectCreationLimitExceeded),
			wantCode: codes.FailedPrecondition,
			wantMsg:  "create: project creation limit exceeded",
		},
		{
			name:     "other error is unchanged",
			err:      errors.New("boom"),
			wantCode: codes.Unknown,
			wantMsg:  "boom",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			st := status.Convert(withCode(tt.err, projectWriteErrCodes...))
			assert.Equal(t, tt.wantCode, st.Code())
			assert.Equal(t, tt.wantMsg, st.Message())
		})
	}
}

func TestWithCode_FirstMatchWins(t *testing.T) {
	err := withCode(interfaces.ErrProjectHasModels,
		errCode{interfaces.ErrProjectHasModels, codes.FailedPrecondition},
		errCode{interfaces.ErrProjectHasModels, codes.Internal},
	)
	assert.Equal(t, codes.FailedPrecondition, status.Code(err))
}

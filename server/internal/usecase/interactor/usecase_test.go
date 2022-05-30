package interactor

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestUc_checkPermission(t *testing.T) {
	tid := id.NewWorkspaceID()

	tests := []struct {
		name               string
		op                 *usecase.Operator
		readableWorkspaces id.WorkspaceIDList
		writableWorkspaces id.WorkspaceIDList
		wantErr            bool
	}{
		{
			name:    "nil operator",
			wantErr: false,
		},
		{
			name:               "nil operator 2",
			readableWorkspaces: id.WorkspaceIDList{id.NewWorkspaceID()},
			wantErr:            false,
		},
		{
			name:               "can read a workspace",
			readableWorkspaces: id.WorkspaceIDList{tid},
			op: &usecase.Operator{
				ReadableWorkspaces: id.WorkspaceIDList{tid},
			},
			wantErr: true,
		},
		{
			name:               "cannot read a workspace",
			readableWorkspaces: id.WorkspaceIDList{id.NewWorkspaceID()},
			op: &usecase.Operator{
				ReadableWorkspaces: id.WorkspaceIDList{},
			},
			wantErr: true,
		},
		{
			name:               "can write a workspace",
			writableWorkspaces: id.WorkspaceIDList{tid},
			op: &usecase.Operator{
				WritableWorkspaces: id.WorkspaceIDList{tid},
			},
			wantErr: true,
		},
		{
			name:               "cannot write a workspace",
			writableWorkspaces: id.WorkspaceIDList{tid},
			op: &usecase.Operator{
				WritableWorkspaces: id.WorkspaceIDList{},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			e := &uc{
				readableWorkspaces: tt.readableWorkspaces,
				writableWorkspaces: tt.writableWorkspaces,
			}
			got := e.checkPermission(tt.op)
			if tt.wantErr {
				assert.Equal(t, interfaces.ErrOperationDenied, got)
			} else {
				assert.Nil(t, got)
			}
		})
	}
}

func TestUc(t *testing.T) {
	workspaces := id.WorkspaceIDList{id.NewWorkspaceID(), id.NewWorkspaceID(), id.NewWorkspaceID()}
	assert.Equal(t, &uc{}, Usecase())
	assert.Equal(t, &uc{readableWorkspaces: workspaces}, (&uc{}).WithReadableWorkspaces(workspaces...))
	assert.Equal(t, &uc{writableWorkspaces: workspaces}, (&uc{}).WithWritableWorkspaces(workspaces...))
	assert.Equal(t, &uc{tx: true}, (&uc{}).Transaction())
}

func TestRun(t *testing.T) {
	ctx := context.Background()
	err := errors.New("test")
	a, b, c := &struct{}{}, &struct{}{}, &struct{}{}
	tr := memory.NewTransaction()
	r := &repo.Container{Transaction: tr}

	// regular1: without tx
	gota, gotb, gotc, goterr := Run3(
		ctx, nil, r,
		Usecase(),
		func() (any, any, any, error) {
			return a, b, c, nil
		},
	)
	assert.Same(t, a, gota)
	assert.Same(t, b, gotb)
	assert.Same(t, c, gotc)
	assert.Nil(t, goterr)
	assert.Equal(t, 0, tr.Committed()) // not committed

	// regular2: with tx
	_ = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func() error {
			return nil
		},
	)
	assert.Equal(t, 1, tr.Committed()) // committed

	// iregular1: the usecase returns an error
	goterr = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func() error {
			return err
		},
	)
	assert.Same(t, err, goterr)
	assert.Equal(t, 1, tr.Committed()) // not committed

	// iregular2: tx.Begin returns an error
	tr.SetBeginError(err)
	tr.SetEndError(nil)
	goterr = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func() error {
			return nil
		},
	)
	assert.Same(t, err, goterr)
	assert.Equal(t, 1, tr.Committed()) // not committed

	// iregular3: tx.End returns an error
	tr.SetBeginError(nil)
	tr.SetEndError(err)
	goterr = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func() error {
			return nil
		},
	)
	assert.Same(t, err, goterr)
	assert.Equal(t, 2, tr.Committed()) // committed but fails
}

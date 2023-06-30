package mongodoc

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestNewWorkspace(t *testing.T) {
	wId := user.NewWorkspaceID()
	tests := []struct {
		name   string
		ws     *user.Workspace
		want   *WorkspaceDocument
		wDocId string
	}{
		{
			name: "new",
			ws:   user.NewWorkspace().ID(wId).Name("abc").Personal(true).MustBuild(),
			want: &WorkspaceDocument{
				ID:           wId.String(),
				Name:         "abc",
				Members:      map[string]WorkspaceMemberDocument{},
				Integrations: map[string]WorkspaceMemberDocument{},
				Personal:     true,
			},
			wDocId: wId.String(),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, wDocId := NewWorkspace(tt.ws)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.wDocId, wDocId)
		})
	}
}

func TestNewWorkspaceConsumer(t *testing.T) {
	c := NewWorkspaceConsumer()
	assert.NotNil(t, c)
}

func TestNewWorkspaces(t *testing.T) {
	wId := user.NewWorkspaceID()
	tests := []struct {
		name       string
		workspaces []*user.Workspace
		want       []*WorkspaceDocument
		wDocIds    []string
	}{
		{
			name:       "new",
			workspaces: []*user.Workspace{user.NewWorkspace().ID(wId).Name("abc").Personal(true).MustBuild()},
			want: []*WorkspaceDocument{
				{
					ID:           wId.String(),
					Name:         "abc",
					Members:      map[string]WorkspaceMemberDocument{},
					Integrations: map[string]WorkspaceMemberDocument{},
					Personal:     true,
				},
			},
			wDocIds: []string{wId.String()},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, wDocIds := NewWorkspaces(tt.workspaces)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.wDocIds, wDocIds)
		})
	}
}

func TestWorkspaceDocument_Model(t *testing.T) {
	wId := user.NewWorkspaceID()
	tests := []struct {
		name    string
		wDoc    *WorkspaceDocument
		want    *user.Workspace
		wantErr bool
	}{
		{
			name: "model",
			wDoc: &WorkspaceDocument{
				ID:           wId.String(),
				Name:         "abc",
				Members:      map[string]WorkspaceMemberDocument{},
				Integrations: map[string]WorkspaceMemberDocument{},
				Personal:     true,
			},
			want:    user.NewWorkspace().ID(wId).Name("abc").Personal(true).MustBuild(),
			wantErr: false,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.wDoc.Model()
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

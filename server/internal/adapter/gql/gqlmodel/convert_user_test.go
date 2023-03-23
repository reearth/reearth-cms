package gqlmodel

import (
	"testing"

	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/stretchr/testify/assert"
)

func TestToRole(t *testing.T) {
	tests := []struct {
		name string
		arg  workspace.Role
		want Role
	}{
		{
			name: "RoleOwner",
			arg:  workspace.RoleOwner,
			want: RoleOwner,
		},
		{
			name: "RoleMaintainer",
			arg:  workspace.RoleMaintainer,
			want: RoleMaintainer,
		},
		{
			name: "RoleWriter",
			arg:  workspace.RoleWriter,
			want: RoleWriter,
		},
		{
			name: "RoleReader",
			arg:  workspace.RoleReader,
			want: RoleReader,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, ToRole(tt.arg))
		})
	}
}

func TestFromRole(t *testing.T) {
	tests := []struct {
		name string
		arg  Role
		want workspace.Role
	}{
		{
			name: "RoleOwner",
			arg:  RoleOwner,
			want: workspace.RoleOwner,
		},
		{
			name: "RoleMaintainer",
			arg:  RoleMaintainer,
			want: workspace.RoleMaintainer,
		},
		{
			name: "RoleWriter",
			arg:  RoleWriter,
			want: workspace.RoleWriter,
		},
		{
			name: "RoleReader",
			arg:  RoleReader,
			want: workspace.RoleReader,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, FromRole(tt.arg))
		})
	}
}

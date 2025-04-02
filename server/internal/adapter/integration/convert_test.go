package integration

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFromPagination(t *testing.T) {
	assert.Equal(t, &usecasex.Pagination{
		Offset: &usecasex.OffsetPagination{
			Offset: 0,
			Limit:  50,
		},
	}, fromPagination(nil, nil))

	assert.Equal(t, &usecasex.Pagination{
		Offset: &usecasex.OffsetPagination{
			Offset: 0,
			Limit:  100,
		},
	}, fromPagination(lo.ToPtr(1), lo.ToPtr(100)))

	assert.Equal(t, &usecasex.Pagination{
		Offset: &usecasex.OffsetPagination{
			Offset: 100,
			Limit:  100,
		},
	}, fromPagination(lo.ToPtr(2), lo.ToPtr(200)))
}

func TestToModelSort(t *testing.T) {
	tests := []struct {
		name     string
		sort     *integrationapi.SortParam
		dir      *integrationapi.SortDirParam
		expected *model.Sort
	}{
		{
			name: "Default direction (nil dir)",
			sort: lo.ToPtr(integrationapi.SortParamCreatedAt),
			dir:  nil,
			expected: &model.Sort{
				Column:    model.ColumnCreatedAt,
				Direction: model.DirectionDesc,
			},
		},
		{
			name: "Sort by CreatedAt Asc",
			sort: lo.ToPtr(integrationapi.SortParamCreatedAt),
			dir:  lo.ToPtr(integrationapi.SortDirParamAsc),
			expected: &model.Sort{
				Column:    model.ColumnCreatedAt,
				Direction: model.DirectionAsc,
			},
		},
		{
			name: "Sort by CreatedAt Desc",
			sort: lo.ToPtr(integrationapi.SortParamCreatedAt),
			dir:  lo.ToPtr(integrationapi.SortDirParamDesc),
			expected: &model.Sort{
				Column:    model.ColumnCreatedAt,
				Direction: model.DirectionDesc,
			},
		},
		{
			name: "Sort by UpdatedAt Asc",
			sort: lo.ToPtr(integrationapi.SortParamUpdatedAt),
			dir:  lo.ToPtr(integrationapi.SortDirParamAsc),
			expected: &model.Sort{
				Column:    model.ColumnUpdatedAt,
				Direction: model.DirectionAsc,
			},
		},
		{
			name: "Sort by UpdatedAt Desc",
			sort: lo.ToPtr(integrationapi.SortParamUpdatedAt),
			dir:  lo.ToPtr(integrationapi.SortDirParamDesc),
			expected: &model.Sort{
				Column:    model.ColumnUpdatedAt,
				Direction: model.DirectionDesc,
			},
		},
		{
			name: "Unknown sort param, defaults to ColumnCreatedAt",
			sort: lo.ToPtr(integrationapi.SortParam("unknown")),
			dir:  lo.ToPtr(integrationapi.SortDirParamAsc),
			expected: &model.Sort{
				Column:    model.ColumnCreatedAt,
				Direction: model.DirectionAsc,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := toModelSort(tt.sort, tt.dir)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func Test_fromProjectPublication(t *testing.T) {
	// nil input
	assert.Nil(t, fromProjectPublication(nil))

	// valid input
	scope := integrationapi.PUBLIC
	pub := &integrationapi.ProjectPublication{
		Scope:       &scope,
		AssetPublic: lo.ToPtr(true),
	}
	result := fromProjectPublication(pub)
	assert.NotNil(t, result)
	assert.Equal(t, project.PublicationScopePublic, *result.Scope)
	assert.Equal(t, true, *result.AssetPublic)
}

func Test_fromProjectPublicationScope(t *testing.T) {
	// nil scope
	assert.Equal(t, project.PublicationScopePrivate, fromProjectPublicationScope(nil))

	// public
	scope := integrationapi.PUBLIC
	assert.Equal(t, project.PublicationScopePublic, fromProjectPublicationScope(&scope))

	// private
	scope = integrationapi.PRIVATE
	assert.Equal(t, project.PublicationScopePrivate, fromProjectPublicationScope(&scope))

	// limited
	scope = integrationapi.LIMITED
	assert.Equal(t, project.PublicationScopeLimited, fromProjectPublicationScope(&scope))
}

func Test_fromRequestRole(t *testing.T) {
	// owner"
	input := integrationapi.OWNER
	expected := lo.ToPtr(workspace.RoleOwner)
	assert.Equal(t, expected, fromRequestRole(input))

	// maintainer"
	input = integrationapi.MAINTAINER
	expected = lo.ToPtr(workspace.RoleMaintainer)
	assert.Equal(t, expected, fromRequestRole(input))

	// writer"
	input = integrationapi.WRITER
	expected = lo.ToPtr(workspace.RoleWriter)
	assert.Equal(t, expected, fromRequestRole(input))

	// reader"
	input = integrationapi.READER
	expected = lo.ToPtr(workspace.RoleReader)
	assert.Equal(t, expected, fromRequestRole(input))

	// unknown"
	input = "UNKNOWN_ROLE"
	expected = nil
	assert.Equal(t, expected, fromRequestRole(input))
}

func Test_fromRequestRoles(t *testing.T) {
	// nil input
	assert.Nil(t, fromRequestRoles(nil))

	// valid roles
	input := &[]integrationapi.ProjectRequestRole{
		integrationapi.OWNER,
		integrationapi.WRITER,
		"UNKNOWN",
		integrationapi.READER,
	}
	expected := []workspace.Role{
		workspace.RoleOwner,
		workspace.RoleWriter,
		workspace.RoleReader,
	}
	assert.Equal(t, expected, fromRequestRoles(input))
}

package integration

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
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
		expected *usecasex.Sort
	}{
		{
			name: "Default direction (nil dir)",
			sort: lo.ToPtr(integrationapi.SortParamCreatedAt),
			dir:  nil,
			expected: &usecasex.Sort{
				Key:      "id",
				Reverted: true,
			},
		},
		{
			name: "Sort by CreatedAt Asc",
			sort: lo.ToPtr(integrationapi.SortParamCreatedAt),
			dir:  lo.ToPtr(integrationapi.SortDirParamAsc),
			expected: &usecasex.Sort{
				Key:      "id",
				Reverted: false,
			},
		},
		{
			name: "Sort by CreatedAt Desc",
			sort: lo.ToPtr(integrationapi.SortParamCreatedAt),
			dir:  lo.ToPtr(integrationapi.SortDirParamDesc),
			expected: &usecasex.Sort{
				Key:      "id",
				Reverted: true,
			},
		},
		{
			name: "Sort by UpdatedAt Asc",
			sort: lo.ToPtr(integrationapi.SortParamUpdatedAt),
			dir:  lo.ToPtr(integrationapi.SortDirParamAsc),
			expected: &usecasex.Sort{
				Key:      "updatedat",
				Reverted: false,
			},
		},
		{
			name: "Sort by UpdatedAt Desc",
			sort: lo.ToPtr(integrationapi.SortParamUpdatedAt),
			dir:  lo.ToPtr(integrationapi.SortDirParamDesc),
			expected: &usecasex.Sort{
				Key:      "updatedat",
				Reverted: true,
			},
		},
		{
			name: "Unknown sort param, defaults to ColumnCreatedAt",
			sort: lo.ToPtr(integrationapi.SortParam("unknown")),
			dir:  lo.ToPtr(integrationapi.SortDirParamAsc),
			expected: &usecasex.Sort{
				Key:      "order",
				Reverted: false,
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

func TestToGroupSort(t *testing.T) {
	tests := []struct {
		name     string
		sort     *integrationapi.SortParam
		dir      *integrationapi.SortDirParam
		expected *group.Sort
	}{
		{
			name: "Default direction (nil dir)",
			sort: lo.ToPtr(integrationapi.SortParamCreatedAt),
			dir:  nil,
			expected: &group.Sort{
				Column:    group.ColumnCreatedAt,
				Direction: group.DirectionDesc,
			},
		},
		{
			name: "Sort by CreatedAt Asc",
			sort: lo.ToPtr(integrationapi.SortParamCreatedAt),
			dir:  lo.ToPtr(integrationapi.SortDirParamAsc),
			expected: &group.Sort{
				Column:    group.ColumnCreatedAt,
				Direction: group.DirectionAsc,
			},
		},
		{
			name: "Sort by CreatedAt Desc",
			sort: lo.ToPtr(integrationapi.SortParamCreatedAt),
			dir:  lo.ToPtr(integrationapi.SortDirParamDesc),
			expected: &group.Sort{
				Column:    group.ColumnCreatedAt,
				Direction: group.DirectionDesc,
			},
		},
		{
			name: "Unknown sort param, defaults to ColumnCreatedAt",
			sort: lo.ToPtr(integrationapi.SortParam("unknown")),
			dir:  lo.ToPtr(integrationapi.SortDirParamAsc),
			expected: &group.Sort{
				Column:    group.ColumnCreatedAt,
				Direction: group.DirectionAsc,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := toGroupSort(tt.sort, tt.dir)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func Test_fromProjectPublicationScope(t *testing.T) {
	// public
	expected := lo.ToPtr(project.VisibilityPublic)
	actual := fromProjectVisibility(integrationapi.PUBLIC)
	assert.Equal(t, expected, actual)

	// private
	expected = lo.ToPtr(project.VisibilityPrivate)
	actual = fromProjectVisibility(integrationapi.PRIVATE)
	assert.Equal(t, expected, actual)

	// unknown
	expected = nil
	actual = fromProjectVisibility(integrationapi.AccessibilityVisibility("unknown"))
	assert.Equal(t, expected, actual)
}

func Test_fromRequestRoles(t *testing.T) {
	t.Run("empty input", func(t *testing.T) {
		input := []integrationapi.ProjectRequestRole{}
		actual, ok := fromRequestRoles(input)
		assert.True(t, ok)
		assert.Nil(t, actual)
	})

	t.Run("invalid input", func(t *testing.T) {
		input := []integrationapi.ProjectRequestRole{
			integrationapi.OWNER,
			integrationapi.WRITER,
			"UNKNOWN",
			integrationapi.READER,
		}
		actual, ok := fromRequestRoles(input)
		assert.False(t, ok)
		assert.Nil(t, actual)
	})

	t.Run("valid input", func(t *testing.T) {
		input := []integrationapi.ProjectRequestRole{
			integrationapi.OWNER,
			integrationapi.WRITER,
			integrationapi.READER,
		}
		actual, ok := fromRequestRoles(input)
		assert.True(t, ok)
		expected := []workspace.Role{
			workspace.RoleOwner,
			workspace.RoleWriter,
			workspace.RoleReader,
		}
		assert.Equal(t, expected, actual)
	})
}

func Test_fromRequestRole(t *testing.T) {
	t.Run("owner", func(t *testing.T) {
		input := integrationapi.OWNER
		actual, ok := fromRequestRole(input)
		expected := lo.ToPtr(workspace.RoleOwner)
		assert.True(t, ok)
		assert.Equal(t, expected, actual)
	})

	t.Run("maintainer", func(t *testing.T) {
		input := integrationapi.MAINTAINER
		actual, ok := fromRequestRole(input)
		expected := lo.ToPtr(workspace.RoleMaintainer)
		assert.True(t, ok)
		assert.Equal(t, expected, actual)
	})

	t.Run("writer", func(t *testing.T) {
		input := integrationapi.WRITER
		actual, ok := fromRequestRole(input)
		expected := lo.ToPtr(workspace.RoleWriter)
		assert.True(t, ok)
		assert.Equal(t, expected, actual)
	})

	t.Run("reader", func(t *testing.T) {
		input := integrationapi.READER
		actual, ok := fromRequestRole(input)
		expected := lo.ToPtr(workspace.RoleReader)
		assert.True(t, ok)
		assert.Equal(t, expected, actual)
	})

	t.Run("unknown role", func(t *testing.T) {
		input := integrationapi.ProjectRequestRole("UNKNOWN_ROLE")
		actual, ok := fromRequestRole(input)
		assert.False(t, ok)
		assert.Nil(t, actual)
	})
}

func TestSortParamTypeConversions(t *testing.T) {
	t.Parallel()

	t.Run("ItemFilterParamsSort to SortParam", func(t *testing.T) {
		t.Parallel()
		tests := []struct {
			name     string
			input    integrationapi.ItemFilterParamsSort
			expected integrationapi.SortParam
		}{
			{
				name:     "createdAt",
				input:    integrationapi.ItemFilterParamsSortCreatedAt,
				expected: integrationapi.SortParamCreatedAt,
			},
			{
				name:     "updatedAt",
				input:    integrationapi.ItemFilterParamsSortUpdatedAt,
				expected: integrationapi.SortParamUpdatedAt,
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				t.Parallel()
				result := integrationapi.SortParam(tt.input)
				assert.Equal(t, tt.expected, result)
			})
		}
	})

	t.Run("ItemFilterPostParamsSort to SortParam", func(t *testing.T) {
		t.Parallel()
		tests := []struct {
			name     string
			input    integrationapi.ItemFilterPostParamsSort
			expected integrationapi.SortParam
		}{
			{
				name:     "createdAt",
				input:    integrationapi.ItemFilterPostParamsSortCreatedAt,
				expected: integrationapi.SortParamCreatedAt,
			},
			{
				name:     "updatedAt",
				input:    integrationapi.ItemFilterPostParamsSortUpdatedAt,
				expected: integrationapi.SortParamUpdatedAt,
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				t.Parallel()
				result := integrationapi.SortParam(tt.input)
				assert.Equal(t, tt.expected, result)
			})
		}
	})

	t.Run("AssetFilterParamsSort to SortParam", func(t *testing.T) {
		t.Parallel()
		tests := []struct {
			name     string
			input    integrationapi.AssetFilterParamsSort
			expected integrationapi.SortParam
		}{
			{
				name:     "createdAt",
				input:    integrationapi.AssetFilterParamsSortCreatedAt,
				expected: integrationapi.SortParamCreatedAt,
			},
			{
				name:     "updatedAt",
				input:    integrationapi.AssetFilterParamsSortUpdatedAt,
				expected: integrationapi.SortParamUpdatedAt,
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				t.Parallel()
				result := integrationapi.SortParam(tt.input)
				assert.Equal(t, tt.expected, result)
			})
		}
	})
}

func TestSortDirParamTypeConversions(t *testing.T) {
	t.Parallel()

	t.Run("ItemFilterParamsDir to SortDirParam", func(t *testing.T) {
		t.Parallel()
		tests := []struct {
			name     string
			input    integrationapi.ItemFilterParamsDir
			expected integrationapi.SortDirParam
		}{
			{
				name:     "asc",
				input:    integrationapi.ItemFilterParamsDirAsc,
				expected: integrationapi.SortDirParamAsc,
			},
			{
				name:     "desc",
				input:    integrationapi.ItemFilterParamsDirDesc,
				expected: integrationapi.SortDirParamDesc,
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				t.Parallel()
				result := integrationapi.SortDirParam(tt.input)
				assert.Equal(t, tt.expected, result)
			})
		}
	})

	t.Run("ItemFilterPostParamsDir to SortDirParam", func(t *testing.T) {
		t.Parallel()
		tests := []struct {
			name     string
			input    integrationapi.ItemFilterPostParamsDir
			expected integrationapi.SortDirParam
		}{
			{
				name:     "asc",
				input:    integrationapi.ItemFilterPostParamsDirAsc,
				expected: integrationapi.SortDirParamAsc,
			},
			{
				name:     "desc",
				input:    integrationapi.ItemFilterPostParamsDirDesc,
				expected: integrationapi.SortDirParamDesc,
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				t.Parallel()
				result := integrationapi.SortDirParam(tt.input)
				assert.Equal(t, tt.expected, result)
			})
		}
	})

	t.Run("AssetFilterParamsDir to SortDirParam", func(t *testing.T) {
		t.Parallel()
		tests := []struct {
			name     string
			input    integrationapi.AssetFilterParamsDir
			expected integrationapi.SortDirParam
		}{
			{
				name:     "asc",
				input:    integrationapi.AssetFilterParamsDirAsc,
				expected: integrationapi.SortDirParamAsc,
			},
			{
				name:     "desc",
				input:    integrationapi.AssetFilterParamsDirDesc,
				expected: integrationapi.SortDirParamDesc,
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				t.Parallel()
				result := integrationapi.SortDirParam(tt.input)
				assert.Equal(t, tt.expected, result)
			})
		}
	})
}

func TestSortParamPointerConversions(t *testing.T) {
	t.Parallel()

	t.Run("pointer conversion for ItemFilterParamsSort", func(t *testing.T) {
		t.Parallel()
		input := lo.ToPtr(integrationapi.ItemFilterParamsSortCreatedAt)
		result := integrationapi.SortParam(*input)
		assert.Equal(t, integrationapi.SortParamCreatedAt, result)
	})

	t.Run("pointer conversion for ItemFilterParamsDir", func(t *testing.T) {
		t.Parallel()
		input := lo.ToPtr(integrationapi.ItemFilterParamsDirAsc)
		result := (*integrationapi.SortDirParam)(input)
		assert.Equal(t, integrationapi.SortDirParamAsc, *result)
	})

	t.Run("pointer conversion for ItemFilterPostParamsSort", func(t *testing.T) {
		t.Parallel()
		input := lo.ToPtr(integrationapi.ItemFilterPostParamsSortUpdatedAt)
		result := integrationapi.SortParam(*input)
		assert.Equal(t, integrationapi.SortParamUpdatedAt, result)
	})

	t.Run("pointer conversion for ItemFilterPostParamsDir", func(t *testing.T) {
		t.Parallel()
		input := lo.ToPtr(integrationapi.ItemFilterPostParamsDirDesc)
		result := (*integrationapi.SortDirParam)(input)
		assert.Equal(t, integrationapi.SortDirParamDesc, *result)
	})
}

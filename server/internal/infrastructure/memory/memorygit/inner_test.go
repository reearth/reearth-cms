package memorygit

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestInnerValues_GetByVersionOrRef(t *testing.T) {
	assert.Equal(t, &innerValue[string]{
		value:   "foo3",
		version: "c",
	}, innerValues[string]([]innerValue[string]{
		{
			value:   "foo1",
			version: "a",
		},
		{
			value:   "foo2",
			version: "b",
		},
		{
			value:   "foo3",
			version: "c",
		},
	}).GetByVersionOrRef(VersionOrRef{
		version: "c",
	}))

	assert.Equal(t, &innerValue[string]{
		value:   "foo2",
		version: "b",
		ref:     lo.ToPtr(Ref("main")),
	}, innerValues[string]([]innerValue[string]{
		{
			value:   "foo1",
			version: "a",
		},
		{
			value:   "foo2",
			version: "b",
			ref:     lo.ToPtr(Ref("main")),
		},
		{
			value:   "foo3",
			version: "c",
		},
	}).GetByVersionOrRef(VersionOrRef{
		ref: "main",
	}))

	assert.Nil(t, innerValues[string]([]innerValue[string]{
		{
			value:   "foo1",
			version: "a",
		},
		{
			value:   "foo2",
			version: "b",
		},
		{
			value:   "foo3",
			version: "c",
		},
	}).GetByVersionOrRef(VersionOrRef{
		version: "d",
	}))

	assert.Nil(t, innerValues[string]([]innerValue[string]{
		{
			value:   "foo1",
			version: "a",
		},
		{
			value:   "foo2",
			version: "b",
		},
		{
			value:   "foo3",
			version: "c",
			ref:     lo.ToPtr(Ref("main")),
		},
	}).GetByVersionOrRef(VersionOrRef{
		ref: "main2",
	}))
}

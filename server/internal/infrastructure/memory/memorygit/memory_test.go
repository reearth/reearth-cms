package memorygit

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestVersionedSyncMap_Load(t *testing.T) {
	m := &util.SyncMap[string, innerValues[string]]{}
	m.Store("a", innerValues[string]{{value: "A", version: "1"}})
	m.Store("b", innerValues[string]{{value: "B", version: "1", ref: lo.ToPtr(Ref("a"))}})
	vsm := &VersionedSyncMap[string, string]{m: m}

	got, ok := vsm.Load("a", VersionOrRef{version: "1"})
	assert.Equal(t, "A", got)
	assert.True(t, ok)

	got2, ok2 := vsm.Load("b", VersionOrRef{ref: "a"})
	assert.Equal(t, "B", got2)
	assert.True(t, ok2)

	got3, ok3 := vsm.Load("a", VersionOrRef{version: "100"})
	assert.Equal(t, "", got3)
	assert.False(t, ok3)

	got4, ok4 := vsm.Load("b", VersionOrRef{ref: "xxxx"})
	assert.Equal(t, "", got4)
	assert.False(t, ok4)
}

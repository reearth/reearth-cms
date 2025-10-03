package publicapi

import (
	"bytes"
	"encoding/json"
	"io"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/group"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewItem(t *testing.T) {
	as := asset.New().
		NewID().
		Project(id.NewProjectID()).
		CreatedByUser(accountdomain.NewUserID()).
		Thread(id.NewThreadID().Ref()).
		Size(1).
		NewUUID().
		MustBuild()
	af := asset.NewFile().Name("name.json").Path("name.json").Size(1).Build()
	as.SetAccessInfoResolver(func(_ *asset.Asset) *asset.AccessInfo {
		return &asset.AccessInfo{
			Public: true,
			Url:    "https://example.com/" + as.ID().String() + af.Path(),
		}
	})
	s2 := schema.New().
		NewID().
		Project(id.NewProjectID()).
		Workspace(accountdomain.NewWorkspaceID()).
		Fields([]*schema.Field{
			schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey("test1")).MustBuild(),
		}).
		MustBuild()

	g := group.New().
		NewID().
		Name("WPMContext group").
		Project(id.NewProjectID()).
		Key(id.NewKey("group1")).
		Schema(s2.ID()).
		MustBuild()

	s := schema.New().
		NewID().
		Project(id.NewProjectID()).
		Workspace(accountdomain.NewWorkspaceID()).
		Fields([]*schema.Field{
			schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey("aaaaa")).MustBuild(),
			schema.NewField(schema.NewAsset().TypeProperty()).NewID().Key(id.NewKey("bbbbb")).MustBuild(),
			schema.NewField(schema.NewGroup(g.ID()).TypeProperty()).NewID().Key(id.NewKey("ggggg")).MustBuild(),
		}).
		MustBuild()
	ig := id.NewItemGroupID()
	it := item.New().
		NewID().
		Schema(id.NewSchemaID()).
		Project(id.NewProjectID()).
		Model(id.NewModelID()).
		Thread(id.NewThreadID().Ref()).
		Fields([]*item.Field{
			item.NewField(s.Fields()[0].ID(), value.New(value.TypeText, "aaaa").AsMultiple(), nil),
			item.NewField(s.Fields()[1].ID(), value.New(value.TypeAsset, as.ID()).AsMultiple(), nil),
			item.NewField(s.Fields()[2].ID(), value.New(value.TypeGroup, ig).AsMultiple(), nil),
			item.NewField(s2.Fields()[0].ID(), value.New(value.TypeText, "xxxx").AsMultiple(), ig.Ref()),
		}).
		MustBuild()
	resGroup := ItemFields{
		"test1": "xxxx",
	}

	assert.Equal(t, Item{
		ID: it.ID().String(),
		Fields: ItemFields(map[string]any{
			"aaaaa": "aaaa",
			"bbbbb": ItemAsset{
				Type: "asset",
				ID:   as.ID().String(),
				URL:  "https://example.com/" + as.ID().String() + af.Path(),
			},
			"ggggg": resGroup,
		}),
	}, NewItem(it, schema.NewPackage(s, nil, map[id.GroupID]*schema.Schema{id.NewGroupID(): s2}, nil), asset.List{as}, nil))

	// no assets
	assert.Equal(t, Item{
		ID: it.ID().String(),
		Fields: ItemFields(map[string]any{
			"aaaaa": "aaaa",
			"ggggg": resGroup,
		}),
	}, NewItem(it, schema.NewPackage(s, nil, map[id.GroupID]*schema.Schema{id.NewGroupID(): s2}, nil), nil, nil))
}

func TestNewItem_Multiple(t *testing.T) {
	as := asset.New().
		NewID().
		Project(id.NewProjectID()).
		CreatedByUser(accountdomain.NewUserID()).
		Thread(id.NewThreadID().Ref()).
		Size(1).
		NewUUID().
		MustBuild()
	af := asset.NewFile().Name("name.json").Path("name.json").Size(1).ContentType("application/json").Build()
	as.SetAccessInfoResolver(func(_ *asset.Asset) *asset.AccessInfo {
		return &asset.AccessInfo{
			Public: true,
			Url:    "https://example.com/" + as.ID().String() + af.Path(),
		}
	})
	s := schema.New().
		NewID().
		Project(id.NewProjectID()).
		Workspace(accountdomain.NewWorkspaceID()).
		Fields([]*schema.Field{
			schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey("aaaaa")).Multiple(true).MustBuild(),
			schema.NewField(schema.NewAsset().TypeProperty()).NewID().Key(id.NewKey("bbbbb")).Multiple(true).MustBuild(),
		}).
		MustBuild()
	it := item.New().
		NewID().
		Schema(id.NewSchemaID()).
		Project(id.NewProjectID()).
		Model(id.NewModelID()).
		Thread(id.NewThreadID().Ref()).
		Fields([]*item.Field{
			item.NewField(s.Fields()[0].ID(), value.New(value.TypeText, "aaaa").AsMultiple(), nil),
			item.NewField(s.Fields()[1].ID(), value.New(value.TypeAsset, as.ID()).AsMultiple(), nil),
		}).
		MustBuild()

	assert.Equal(t, Item{
		ID: it.ID().String(),
		Fields: ItemFields(map[string]any{
			"aaaaa": []any{"aaaa"},
			"bbbbb": []ItemAsset{{
				Type: "asset",
				ID:   as.ID().String(),
				URL:  "https://example.com/" + as.ID().String() + af.Path(),
			}},
		}),
	}, NewItem(it, schema.NewPackage(s, nil, nil, nil), asset.List{as}, nil))

	// no assets
	assert.Equal(t, Item{
		ID: it.ID().String(),
		Fields: ItemFields(map[string]any{
			"aaaaa": []any{"aaaa"},
		}),
	}, NewItem(it, schema.NewPackage(s, nil, nil, nil), nil, nil))
}

func TestItem_MarshalJSON(t *testing.T) {
	j := lo.Must(json.Marshal(Item{
		ID: "xxx",
		Fields: ItemFields{
			"aaa": "aa",
			"bbb": ItemAsset{
				Type: "asset",
				ID:   "xxx",
				URL:  "https://example.com",
			},
		},
	}))

	v := map[string]any{}
	lo.Must0(json.Unmarshal(j, &v))

	assert.Equal(t, map[string]any{
		"id":  "xxx",
		"aaa": "aa",
		"bbb": map[string]any{
			"type": "asset",
			"id":   "xxx",
			"url":  "https://example.com",
		},
	}, v)
}

func TestNewListResult(t *testing.T) {
	assert.Equal(t, ListResult[any]{
		Results:    []any{},
		TotalCount: 1010,
		HasMore:    lo.ToPtr(true),
		Limit:      lo.ToPtr(int64(100)),
		Offset:     lo.ToPtr(int64(250)),
		Page:       lo.ToPtr(int64(3)),
	}, NewListResult[any](nil, &usecasex.PageInfo{
		TotalCount: 1010,
	}, usecasex.OffsetPagination{
		Offset: 250,
		Limit:  100,
	}.Wrap()))

	assert.Equal(t, ListResult[any]{
		Results:    []any{},
		TotalCount: 150,
		HasMore:    lo.ToPtr(false),
		Limit:      lo.ToPtr(int64(100)),
		Offset:     lo.ToPtr(int64(100)),
		Page:       lo.ToPtr(int64(2)),
	}, NewListResult[any](nil, &usecasex.PageInfo{
		TotalCount: 150,
	}, usecasex.OffsetPagination{
		Offset: 100,
		Limit:  100,
	}.Wrap()))

	assert.Equal(t, ListResult[any]{
		Results:    []any{},
		TotalCount: 50,
		HasMore:    lo.ToPtr(false),
		Limit:      lo.ToPtr(int64(50)),
		Offset:     lo.ToPtr(int64(0)),
		Page:       lo.ToPtr(int64(1)),
	}, NewListResult[any](nil, &usecasex.PageInfo{
		TotalCount: 50,
	}, usecasex.OffsetPagination{
		Offset: 0,
		Limit:  50,
	}.Wrap()))

	assert.Equal(t, ListResult[any]{
		Results:    []any{},
		TotalCount: 50,
		HasMore:    lo.ToPtr(true),
		NextCursor: lo.ToPtr("cur"),
	}, NewListResult[any](nil, &usecasex.PageInfo{
		TotalCount:  50,
		EndCursor:   usecasex.Cursor("cur").Ref(),
		HasNextPage: true,
	}, usecasex.CursorPagination{
		First: lo.ToPtr(int64(100)),
	}.Wrap()))
}

func TestWriterToItems(t *testing.T) {
	// Test with valid JSON containing items array
	validJSON := `{"results":[{"id":"1","name":"item1"},{"id":"2","name":"item2"}],"total":2}`
	buf := bytes.NewBufferString(validJSON)

	items := writerToItems(buf)
	assert.Equal(t, 2, len(items))

	// Test with empty buffer
	emptyBuf := bytes.NewBuffer(nil)
	emptyItems := writerToItems(emptyBuf)
	assert.Equal(t, 0, len(emptyItems))

	// Test with invalid JSON
	invalidJSON := `{"invalid": json`
	invalidBuf := bytes.NewBufferString(invalidJSON)
	invalidItems := writerToItems(invalidBuf)
	assert.Equal(t, 0, len(invalidItems))

	// Test with JSON without items field
	noItemsJSON := `{"data":[],"total":0}`
	noItemsBuf := bytes.NewBufferString(noItemsJSON)
	noItems := writerToItems(noItemsBuf)
	assert.Equal(t, 0, len(noItems))

	// Test with non-buffer writer (should return empty slice)
	var nonBuf io.Writer = &bytes.Buffer{}
	nonBufItems := writerToItems(nonBuf)
	assert.Equal(t, 0, len(nonBufItems))
}

func TestNewItemListResult(t *testing.T) {
	// Test with buffer containing JSON items
	validJSON := `{"results":[{"id":"1","name":"item1"},{"id":"2","name":"item2"}],"total":2}`
	buf := bytes.NewBufferString(validJSON)

	pi := &usecasex.PageInfo{
		TotalCount: 100,
	}

	p := usecasex.OffsetPagination{
		Offset: 0,
		Limit:  10,
	}.Wrap()

	result := NewItemListResult(buf, pi, p)

	assert.Equal(t, int64(100), result.TotalCount)
	assert.Equal(t, 2, len(result.Results))
	assert.NotNil(t, result.HasMore)
	assert.True(t, *result.HasMore)
	assert.Equal(t, lo.ToPtr(int64(10)), result.Limit)
	assert.Equal(t, lo.ToPtr(int64(0)), result.Offset)
	assert.Equal(t, lo.ToPtr(int64(1)), result.Page)
}

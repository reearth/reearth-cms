package publicapi

import (
	"encoding/json"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewItem(t *testing.T) {
	as := asset.New().
		NewID().
		Project(id.NewProjectID()).
		CreatedByUser(id.NewUserID()).
		Thread(id.NewThreadID()).
		File(asset.NewFile().Name("name.json").Path("name.json").Size(1).ContentType("application/json").Build()).
		Size(1).
		MustBuild()
	s := schema.New().
		NewID().
		Project(id.NewProjectID()).
		Workspace(id.NewWorkspaceID()).
		Fields([]*schema.Field{
			schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(key.New("aaaaa")).MustBuild(),
			schema.NewField(schema.NewAsset().TypeProperty()).NewID().Key(key.New("bbbbb")).MustBuild(),
		}).
		MustBuild()
	it := item.New().
		NewID().
		Schema(id.NewSchemaID()).
		Project(id.NewProjectID()).
		Model(id.NewModelID()).
		Thread(id.NewThreadID()).
		Fields([]*item.Field{
			item.NewField(s.Fields()[0].ID(), value.New(value.TypeText, "aaaa").Some()),
			item.NewField(s.Fields()[1].ID(), value.New(value.TypeAsset, as.ID()).Some()),
		}).
		MustBuild()

	assert.Equal(t, Item{
		ID: it.ID().String(),
		Fields: ItemFields(map[string]ItemField{
			"aaaaa": {Value: "aaaa"},
			"bbbbb": {
				Value: as.ID().String(),
				Asset: Asset{
					Type:        "asset",
					URL:         "https://example.com/" + as.ID().String(),
					ContentType: "application/json",
				},
			},
		}),
	}, NewItem(it, s, asset.List{as}, func(a *asset.Asset) string {
		return "https://example.com/" + a.ID().String()
	}))
}

func TestItem_MarshalJSON(t *testing.T) {
	j := lo.Must(json.Marshal(Item{
		ID: "xxx",
		Fields: ItemFields{
			"aaa": {Value: "aa"},
			"bbb": {Asset: Asset{
				Type:        "asset",
				URL:         "https://example.com",
				ContentType: "application/json",
			}},
		},
	}))

	v := map[string]any{}
	lo.Must0(json.Unmarshal(j, &v))

	assert.Equal(t, map[string]any{
		"id":  "xxx",
		"aaa": "aa",
		"bbb": map[string]any{
			"type":        "asset",
			"url":         "https://example.com",
			"contentType": "application/json",
		},
	}, v)
}

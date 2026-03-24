package exporters

import (
	"encoding/json"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestMapFromItem_GroupWithoutIdField(t *testing.T) {

	tests := []struct {
		name            string
		groupFields     []*schema.Field
		groupFieldKey   string
		groupFieldValue any
		expectedValue   any
	}{
		{
			name: "single group with text field",
			groupFields: []*schema.Field{
				schema.NewField(schema.NewText(nil).TypeProperty()).
					NewID().
					Key(id.NewKey("text-field")).
					MustBuild(),
			},
			groupFieldKey:   "text-field",
			groupFieldValue: "group value",
			expectedValue:   "group value",
		},
		{
			name: "single group with number field",
			groupFields: []*schema.Field{
				func() *schema.Field {
					intField, _ := schema.NewInteger(nil, nil)
					return schema.NewField(intField.TypeProperty()).
						NewID().
						Key(id.NewKey("count")).
						MustBuild()
				}(),
			},
			groupFieldKey:   "count",
			groupFieldValue: int64(42),
			expectedValue:   int64(42),
		},
		{
			name: "single group with boolean field",
			groupFields: []*schema.Field{
				schema.NewField(schema.NewBool().TypeProperty()).
					NewID().
					Key(id.NewKey("active")).
					MustBuild(),
			},
			groupFieldKey:   "active",
			groupFieldValue: true,
			expectedValue:   true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Create a group schema with specified fields
			groupSchema := schema.New().
				NewID().
				Project(id.NewProjectID()).
				Workspace(accountdomain.NewWorkspaceID()).
				Fields(tt.groupFields).
				MustBuild()

			// Create a group
			grp := group.New().
				NewID().
				Name("test-group").
				Project(id.NewProjectID()).
				Key(id.NewKey("test-group")).
				Schema(groupSchema.ID()).
				MustBuild()

			// Create main schema with group field
			mainSchema := schema.New().
				NewID().
				Project(id.NewProjectID()).
				Workspace(accountdomain.NewWorkspaceID()).
				Fields([]*schema.Field{
					schema.NewField(schema.NewText(nil).TypeProperty()).
						NewID().
						Key(id.NewKey("main-text")).
						MustBuild(),
					schema.NewField(schema.NewGroup(grp.ID()).TypeProperty()).
						NewID().
						Key(id.NewKey("my-group")).
						MustBuild(),
				}).
				MustBuild()

			// Create item with group
			itemGroupID := id.NewItemGroupID()

			// Determine value type for field creation
			var fieldValue *value.Multiple
			switch v := tt.groupFieldValue.(type) {
			case string:
				fieldValue = value.New(value.TypeText, v).AsMultiple()
			case int64:
				fieldValue = value.New(value.TypeInteger, v).AsMultiple()
			case bool:
				fieldValue = value.New(value.TypeBool, v).AsMultiple()
			}

			itm := item.New().
				NewID().
				Schema(mainSchema.ID()).
				Project(id.NewProjectID()).
				Model(id.NewModelID()).
				Thread(id.NewThreadID().Ref()).
				Fields([]*item.Field{
					item.NewField(mainSchema.Fields()[0].ID(), value.New(value.TypeText, "main value").AsMultiple(), nil),
					item.NewField(mainSchema.Fields()[1].ID(), value.New(value.TypeGroup, itemGroupID).AsMultiple(), nil),
					item.NewField(groupSchema.Fields()[0].ID(), fieldValue, itemGroupID.Ref()),
				}).
				MustBuild()

			// Create schema package
			sp := schema.NewPackage(mainSchema, nil, map[id.GroupID]*schema.Schema{grp.ID(): groupSchema}, nil)

			// Test MapFromItem
			result := MapFromItem(itm, sp, nil, nil)

			// Assert item has id (it's a *string)
			idPtr, ok := result["id"].(*string)
			assert.True(t, ok, "id should be *string")
			assert.NotNil(t, idPtr)
			assert.Equal(t, itm.ID().String(), *idPtr)

			// Assert main fields
			assert.Equal(t, "main value", result["main-text"])

			// Assert group field exists
			groupField, ok := result["my-group"].(ItemMap)
			assert.True(t, ok, "Group field should be ItemMap")
			assert.NotNil(t, groupField)

			// Assert group has the expected field value
			assert.Equal(t, tt.expectedValue, groupField[tt.groupFieldKey])

			// Assert group does NOT have "id" field (this is the bug fix)
			_, hasId := groupField["id"]
			assert.False(t, hasId, "Group should NOT have 'id' field")

			// Verify JSON output doesn't contain id: null in group
			jsonBytes, err := json.Marshal(result)
			assert.NoError(t, err)

			jsonStr := string(jsonBytes)
			assert.NotContains(t, jsonStr, `"id":null`, "JSON should not contain id:null in groups")
		})
	}
}

func TestMapFromItem_MultipleGroupsWithoutIdField(t *testing.T) {

	tests := []struct {
		name           string
		groupCount     int
		expectedValues []string
	}{
		{
			name:           "two groups",
			groupCount:     2,
			expectedValues: []string{"first", "second"},
		},
		{
			name:           "three groups",
			groupCount:     3,
			expectedValues: []string{"first", "second", "third"},
		},
		{
			name:           "single group in multiple field",
			groupCount:     1,
			expectedValues: []string{"only"},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Create a group schema
			groupSchema := schema.New().
				NewID().
				Project(id.NewProjectID()).
				Workspace(accountdomain.NewWorkspaceID()).
				Fields([]*schema.Field{
					schema.NewField(schema.NewText(nil).TypeProperty()).
						NewID().
						Key(id.NewKey("name")).
						MustBuild(),
				}).
				MustBuild()

			grp := group.New().
				NewID().
				Name("test-group").
				Project(id.NewProjectID()).
				Key(id.NewKey("test-group")).
				Schema(groupSchema.ID()).
				MustBuild()

			// Create main schema with multiple group field
			mainSchema := schema.New().
				NewID().
				Project(id.NewProjectID()).
				Workspace(accountdomain.NewWorkspaceID()).
				Fields([]*schema.Field{
					schema.NewField(schema.NewGroup(grp.ID()).TypeProperty()).
						NewID().
						Key(id.NewKey("items")).
						Multiple(true).
						MustBuild(),
				}).
				MustBuild()

			// Create item with multiple groups based on test case
			groupIDs := make([]id.ItemGroupID, tt.groupCount)
			groupValues := make([]*value.Value, tt.groupCount)
			for i := 0; i < tt.groupCount; i++ {
				groupIDs[i] = id.NewItemGroupID()
				groupValues[i] = value.TypeGroup.Value(groupIDs[i])
			}

			fields := []*item.Field{
				item.NewField(
					mainSchema.Fields()[0].ID(),
					value.MultipleFrom(value.TypeGroup, groupValues),
					nil,
				),
			}

			// Add field for each group
			for i := 0; i < tt.groupCount; i++ {
				fields = append(fields, item.NewField(
					groupSchema.Fields()[0].ID(),
					value.New(value.TypeText, tt.expectedValues[i]).AsMultiple(),
					groupIDs[i].Ref(),
				))
			}

			itm := item.New().
				NewID().
				Schema(mainSchema.ID()).
				Project(id.NewProjectID()).
				Model(id.NewModelID()).
				Thread(id.NewThreadID().Ref()).
				Fields(fields).
				MustBuild()

			sp := schema.NewPackage(mainSchema, nil, map[id.GroupID]*schema.Schema{grp.ID(): groupSchema}, nil)

			result := MapFromItem(itm, sp, nil, nil)

			// Assert multiple groups
			items, ok := result["items"].([]ItemMap)
			assert.True(t, ok, "items should be []ItemMap")
			assert.Len(t, items, tt.groupCount)

			// Assert each group
			for i := 0; i < tt.groupCount; i++ {
				assert.Equal(t, tt.expectedValues[i], items[i]["name"], "Group %d should have correct name", i)
				_, hasId := items[i]["id"]
				assert.False(t, hasId, "Group %d should NOT have 'id' field", i)
			}
		})
	}
}

func TestDropEmptyFields_NilPointer(t *testing.T) {

	tests := []struct {
		name          string
		input         ItemMap
		expectedKeys  []string
		droppedKeys   []string
		expectedValue func(ItemMap) bool
	}{
		{
			name: "nil pointer should be dropped",
			input: ItemMap{
				"text":       "value",
				"nilPointer": (*string)(nil),
			},
			expectedKeys: []string{"text"},
			droppedKeys:  []string{"nilPointer"},
			expectedValue: func(m ItemMap) bool {
				return m["text"] == "value"
			},
		},
		{
			name: "nil value should be dropped",
			input: ItemMap{
				"text":     "value",
				"nilValue": nil,
			},
			expectedKeys: []string{"text"},
			droppedKeys:  []string{"nilValue"},
			expectedValue: func(m ItemMap) bool {
				return m["text"] == "value"
			},
		},
		{
			name: "empty slice should be dropped",
			input: ItemMap{
				"validSlice": []string{"a"},
				"emptySlice": []string{},
			},
			expectedKeys: []string{"validSlice"},
			droppedKeys:  []string{"emptySlice"},
			expectedValue: func(m ItemMap) bool {
				slice, ok := m["validSlice"].([]string)
				return ok && len(slice) == 1 && slice[0] == "a"
			},
		},
		{
			name: "empty map should be dropped",
			input: ItemMap{
				"validMap": map[string]string{"key": "value"},
				"emptyMap": map[string]string{},
			},
			expectedKeys: []string{"validMap"},
			droppedKeys:  []string{"emptyMap"},
			expectedValue: func(m ItemMap) bool {
				mp, ok := m["validMap"].(map[string]string)
				return ok && mp["key"] == "value"
			},
		},
		{
			name: "nil interface should be dropped",
			input: ItemMap{
				"text":         "value",
				"nilInterface": (interface{})(nil),
			},
			expectedKeys: []string{"text"},
			droppedKeys:  []string{"nilInterface"},
			expectedValue: func(m ItemMap) bool {
				return m["text"] == "value"
			},
		},
		{
			name: "multiple empty values",
			input: ItemMap{
				"text":       "value",
				"nilPointer": (*string)(nil),
				"nilValue":   nil,
				"emptySlice": []string{},
				"validSlice": []string{"a"},
			},
			expectedKeys: []string{"text", "validSlice"},
			droppedKeys:  []string{"nilPointer", "nilValue", "emptySlice"},
			expectedValue: func(m ItemMap) bool {
				return m["text"] == "value" && len(m["validSlice"].([]string)) == 1
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := tt.input.DropEmptyFields()

			// Assert expected keys exist
			for _, key := range tt.expectedKeys {
				_, exists := result[key]
				assert.True(t, exists, "Key %q should exist", key)
			}

			// Assert dropped keys do not exist
			for _, key := range tt.droppedKeys {
				_, exists := result[key]
				assert.False(t, exists, "Key %q should be dropped", key)
			}

			// Assert expected values
			assert.True(t, tt.expectedValue(result), "Expected value check failed")
		})
	}
}

func TestMapFromItem_GroupWithAssets(t *testing.T) {

	tests := []struct {
		name          string
		assetURLs     []string
		groupFieldKey string
		multiple      bool
		withTextField bool
	}{
		{
			name:          "single asset in group",
			assetURLs:     []string{"https://example.com/asset.jpg"},
			groupFieldKey: "photo",
			multiple:      false,
			withTextField: false,
		},
		{
			name:          "multiple assets in group",
			assetURLs:     []string{"https://example.com/photo1.jpg", "https://example.com/photo2.jpg"},
			groupFieldKey: "photos",
			multiple:      true,
			withTextField: false,
		},
		{
			name:          "asset with text field in group",
			assetURLs:     []string{"https://example.com/image.png"},
			groupFieldKey: "image",
			multiple:      false,
			withTextField: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Create assets
			assets := make([]*asset.Asset, len(tt.assetURLs))
			for i, url := range tt.assetURLs {
				as := asset.New().
					NewID().
					Project(id.NewProjectID()).
					CreatedByUser(accountdomain.NewUserID()).
					Thread(id.NewThreadID().Ref()).
					Size(100).
					NewUUID().
					MustBuild()

				capturedURL := url
				as.SetAccessInfoResolver(func(a *asset.Asset) *asset.AccessInfo {
					return &asset.AccessInfo{
						Public: true,
						Url:    capturedURL,
					}
				})
				assets[i] = as
			}

			// Create group schema with asset field
			groupFields := []*schema.Field{
				schema.NewField(schema.NewAsset().TypeProperty()).
					NewID().
					Key(id.NewKey(tt.groupFieldKey)).
					Multiple(tt.multiple).
					MustBuild(),
			}

			// Add text field if needed
			if tt.withTextField {
				groupFields = append(groupFields, schema.NewField(schema.NewText(nil).TypeProperty()).
					NewID().
					Key(id.NewKey("caption")).
					MustBuild())
			}

			groupSchema := schema.New().
				NewID().
				Project(id.NewProjectID()).
				Workspace(accountdomain.NewWorkspaceID()).
				Fields(groupFields).
				MustBuild()

			grp := group.New().
				NewID().
				Name("media-group").
				Project(id.NewProjectID()).
				Key(id.NewKey("media-group")).
				Schema(groupSchema.ID()).
				MustBuild()

			mainSchema := schema.New().
				NewID().
				Project(id.NewProjectID()).
				Workspace(accountdomain.NewWorkspaceID()).
				Fields([]*schema.Field{
					schema.NewField(schema.NewGroup(grp.ID()).TypeProperty()).
						NewID().
						Key(id.NewKey("media")).
						MustBuild(),
				}).
				MustBuild()

			// Create item with group containing asset(s)
			itemGroupID := id.NewItemGroupID()

			itemFields := []*item.Field{
				item.NewField(mainSchema.Fields()[0].ID(), value.New(value.TypeGroup, itemGroupID).AsMultiple(), nil),
			}

			// Add asset field(s)
			if tt.multiple {
				assetValues := make([]*value.Value, len(assets))
				for i, as := range assets {
					assetValues[i] = value.TypeAsset.Value(as.ID())
				}
				itemFields = append(itemFields, item.NewField(
					groupSchema.Fields()[0].ID(),
					value.MultipleFrom(value.TypeAsset, assetValues),
					itemGroupID.Ref(),
				))
			} else {
				itemFields = append(itemFields, item.NewField(
					groupSchema.Fields()[0].ID(),
					value.New(value.TypeAsset, assets[0].ID()).AsMultiple(),
					itemGroupID.Ref(),
				))
			}

			// Add text field if needed
			if tt.withTextField {
				itemFields = append(itemFields, item.NewField(
					groupSchema.Fields()[1].ID(),
					value.New(value.TypeText, "Test caption").AsMultiple(),
					itemGroupID.Ref(),
				))
			}

			itm := item.New().
				NewID().
				Schema(mainSchema.ID()).
				Project(id.NewProjectID()).
				Model(id.NewModelID()).
				Thread(id.NewThreadID().Ref()).
				Fields(itemFields).
				MustBuild()

			sp := schema.NewPackage(mainSchema, nil, map[id.GroupID]*schema.Schema{grp.ID(): groupSchema}, nil)

			// Asset loader
			al := func(aids id.AssetIDList) (asset.List, error) {
				return asset.List(assets), nil
			}

			result := MapFromItem(itm, sp, al, nil)

			// Assert group exists
			groupField, ok := result["media"].(ItemMap)
			assert.True(t, ok, "media should be ItemMap")
			assert.NotNil(t, groupField)

			// Assert group has asset(s) with URL
			assetField, hasAsset := groupField[tt.groupFieldKey]
			assert.True(t, hasAsset, "Group should have %s field", tt.groupFieldKey)

			if tt.multiple {
				assetList, ok := assetField.([]types.Asset)
				assert.True(t, ok, "Asset field should be []types.Asset")
				assert.Len(t, assetList, len(tt.assetURLs))
				for i, assetValue := range assetList {
					assert.Equal(t, "asset", assetValue.Type)
					assert.Equal(t, assets[i].ID().String(), assetValue.ID)
					assert.Equal(t, tt.assetURLs[i], assetValue.URL)
				}
			} else {
				assetValue, ok := assetField.(types.Asset)
				assert.True(t, ok, "Asset field should be types.Asset")
				assert.Equal(t, "asset", assetValue.Type)
				assert.Equal(t, assets[0].ID().String(), assetValue.ID)
				assert.Equal(t, tt.assetURLs[0], assetValue.URL)
			}

			// Assert text field if present
			if tt.withTextField {
				caption, hasCaption := groupField["caption"]
				assert.True(t, hasCaption, "Group should have caption field")
				assert.Equal(t, "Test caption", caption)
			}

			// Assert group does NOT have "id" field
			_, hasId := groupField["id"]
			assert.False(t, hasId, "Group with asset should NOT have 'id' field")
		})
	}
}

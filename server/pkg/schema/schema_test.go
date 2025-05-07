package schema

import (
	"io"
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestSchema_AddField(t *testing.T) {
	fid := NewFieldID()
	tests := []struct {
		name string
		s    *Schema
		f    *Field
		want *Schema
	}{
		{
			name: "add on empty array",
			s:    &Schema{},
			f:    &Field{name: "f1"},
			want: &Schema{fields: []*Field{{name: "f1", order: 0}}},
		},
		{
			name: "add on not empty array",
			s:    &Schema{fields: []*Field{{id: fid, name: "f1", order: 1}}},
			f:    &Field{name: "f2"},
			want: &Schema{fields: []*Field{{id: fid, name: "f1", order: 1}, {name: "f2", order: 2}}},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid, name: "f1"}}},
			f:    &Field{id: fid, name: "f2"},
			want: &Schema{fields: []*Field{{id: fid, name: "f1"}}},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			tc.s.AddField(tc.f)
			assert.Equal(t, tc.want, tc.s)
		})
	}
}

func TestSchema_HasField(t *testing.T) {
	fid1 := NewFieldID()
	fid2 := NewFieldID()
	fid3 := NewFieldID()
	tests := []struct {
		name string
		s    *Schema
		fid  FieldID
		want bool
	}{
		{
			name: "add on empty array",
			s:    &Schema{},
			fid:  fid1,
			want: false,
		},
		{
			name: "add on not empty array",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}}},
			fid:  fid1,
			want: true,
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid1,
			want: true,
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  NewFieldID(),
			want: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.HasField(tc.fid))
		})
	}
}

func TestSchema_RemoveField(t *testing.T) {
	fid1 := NewFieldID()
	fid2 := NewFieldID()
	fid3 := NewFieldID()
	tests := []struct {
		name string
		s    *Schema
		fid  FieldID
		want *Schema
	}{
		{
			name: "add on empty array",
			s:    &Schema{},
			fid:  fid1,
			want: &Schema{},
		},
		{
			name: "add on not empty array",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}}},
			fid:  fid1,
			want: &Schema{fields: []*Field{}},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid1,
			want: &Schema{fields: []*Field{{id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid2,
			want: &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid3, name: "f3"}}},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}, titleField: fid3.Ref()},
			fid:  fid3,
			want: &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}}},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			tc.s.RemoveField(tc.fid)
			assert.Equal(t, tc.want, tc.s)
		})
	}
}

func TestSchema_Field(t *testing.T) {
	fid1 := NewFieldID()
	fid2 := NewFieldID()
	fid3 := NewFieldID()
	tests := []struct {
		name string
		s    *Schema
		fid  FieldID
		want *Field
	}{
		{
			name: "add on empty array",
			s:    &Schema{},
			fid:  fid1,
			want: nil,
		},
		{
			name: "add on not empty array",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}}},
			fid:  fid1,
			want: &Field{id: fid1, name: "f1"},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid1,
			want: &Field{id: fid1, name: "f1"},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid2,
			want: &Field{id: fid2, name: "f2"},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fid:  fid3,
			want: &Field{id: fid3, name: "f3"},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.Field(tc.fid))
		})
	}
}

func TestSchema_FieldByIDOrKey(t *testing.T) {
	f1 := &Field{id: NewFieldID(), name: "f1"}
	f2 := &Field{id: NewFieldID(), name: "f2"}
	f3 := &Field{id: NewFieldID(), name: "f3", key: id.NewKey("KEY")}
	f4 := &Field{id: NewFieldID(), name: "f4", key: id.NewKey("id")}
	s := &Schema{fields: []*Field{f1, f2, f3, f4}}

	assert.Equal(t, f1, s.FieldByIDOrKey(f1.ID().Ref(), nil))
	assert.Equal(t, f2, s.FieldByIDOrKey(f2.ID().Ref(), nil))
	assert.Equal(t, f3, s.FieldByIDOrKey(f3.ID().Ref(), nil))
	assert.Equal(t, f4, s.FieldByIDOrKey(f4.ID().Ref(), nil))
	assert.Equal(t, f3, s.FieldByIDOrKey(nil, f3.Key().Ref()))
	assert.Equal(t, f1, s.FieldByIDOrKey(f1.ID().Ref(), f3.Key().Ref()))
	assert.Nil(t, s.FieldByIDOrKey(id.NewFieldID().Ref(), nil))
	assert.Nil(t, s.FieldByIDOrKey(nil, id.NewKey("").Ref()))
	assert.Nil(t, s.FieldByIDOrKey(nil, id.NewKey("x").Ref()))
	assert.Nil(t, s.FieldByIDOrKey(nil, id.NewKey("id").Ref()))
}

func TestSchema_Fields(t *testing.T) {
	fid1 := NewFieldID()
	fid2 := NewFieldID()
	fid3 := NewFieldID()
	tests := []struct {
		name string
		s    *Schema
		want FieldList
	}{
		{
			name: "add on not empty array",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}}},
			want: []*Field{{id: fid1, name: "f1"}},
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			want: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.Fields())
		})
	}
}

func TestSchema_FieldsByType(t *testing.T) {
	fid1 := NewFieldID()
	f1 := Field{id: fid1, name: "f1", typeProperty: &TypeProperty{t: value.TypeBool, bool: NewBool()}}
	fid2 := NewFieldID()
	f2 := Field{id: fid2, name: "f2", typeProperty: &TypeProperty{t: value.TypeText, text: NewText(nil)}}
	fid3 := NewFieldID()
	f3 := Field{id: fid3, name: "f3", typeProperty: &TypeProperty{t: value.TypeBool, bool: NewBool()}}
	s := &Schema{fields: []*Field{&f1, &f2, &f3}}

	assert.Equal(t, FieldList{&f1, &f3}, s.FieldsByType(value.TypeBool))
}

func TestSchema_ID(t *testing.T) {
	sid := NewID()
	tests := []struct {
		name string
		s    Schema
		want ID
	}{
		{
			name: "id",
			want: ID{},
		},
		{
			name: "id",
			s: Schema{
				id: sid,
			},
			want: sid,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.ID())
		})
	}
}

func TestSchema_SetWorkspace(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	tests := []struct {
		name string
		wid  accountdomain.WorkspaceID
		want *Schema
	}{
		{
			name: "id",
			wid:  wid,
			want: &Schema{workspace: wid},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			s := &Schema{}
			s.SetWorkspace(tt.wid)
			assert.Equal(t, tt.want, s)
		})
	}
}

func TestSchema_Workspace(t *testing.T) {
	wId := accountdomain.NewWorkspaceID()
	tests := []struct {
		name string
		s    Schema
		want accountdomain.WorkspaceID
	}{
		{
			name: "id",
			want: accountdomain.WorkspaceID{},
		},
		{
			name: "id",
			s: Schema{
				workspace: wId,
			},
			want: wId,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.Workspace())
		})
	}
}

func TestSchema_Project(t *testing.T) {
	pId := id.NewProjectID()
	tests := []struct {
		name string
		s    Schema
		want id.ProjectID
	}{
		{
			name: "id",
			want: id.ProjectID{},
		},
		{
			name: "id",
			s: Schema{
				project: pId,
			},
			want: pId,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.Project())
		})
	}
}

func TestSchema_TitleField(t *testing.T) {
	s1 := &Schema{}
	assert.Nil(t, s1.TitleField())

	fid := id.NewFieldID()
	s2 := &Schema{
		titleField: &fid,
		fields:     []*Field{{id: fid, name: "f1"}},
	}
	assert.Equal(t, fid.Ref(), s2.TitleField().Ref())

	fid3 := id.NewFieldID()
	s3 := &Schema{
		titleField: fid3.Ref(),
	}
	assert.Nil(t, s3.TitleField())

	s4 := &Schema{
		fields:     []*Field{},
		titleField: fid3.Ref(),
	}
	assert.Nil(t, s4.TitleField())
}

func TestSchema_SetTitleField(t *testing.T) {
	sf := NewField(NewBool().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f := []*Field{sf}
	s := New().NewID().Project(id.NewProjectID()).Workspace(accountdomain.NewWorkspaceID()).Fields(f).MustBuild()

	err := s.SetTitleField(id.NewFieldID().Ref())
	assert.ErrorIs(t, err, ErrInvalidTitleField)

	err = s.SetTitleField(sf.ID().Ref())
	assert.NoError(t, err)
	assert.Equal(t, sf.ID().Ref(), s.TitleField().Ref())

	f2 := []*Field{}
	s2 := New().NewID().Project(id.NewProjectID()).Workspace(accountdomain.NewWorkspaceID()).Fields(f2).MustBuild()
	err = s2.SetTitleField(id.NewFieldID().Ref())
	assert.ErrorIs(t, err, ErrInvalidTitleField)

	s3 := New().NewID().Project(id.NewProjectID()).Workspace(accountdomain.NewWorkspaceID()).Fields(nil).MustBuild()
	err = s3.SetTitleField(id.NewFieldID().Ref())
	assert.ErrorIs(t, err, ErrInvalidTitleField)
}

func TestSchema_Clone(t *testing.T) {
	s := &Schema{id: NewID(), fields: []*Field{{id: id.NewFieldID(), name: "f1"}}, titleField: NewFieldID().Ref()}
	c := s.Clone()
	assert.Equal(t, s, c)
	assert.NotSame(t, s, c)

	s = nil
	c = s.Clone()
	assert.Nil(t, c)
}

func TestSchema_HasFieldByKey(t *testing.T) {
	fid1 := NewFieldID()
	fid2 := NewFieldID()
	fid3 := NewFieldID()
	tests := []struct {
		name string
		s    *Schema
		fKey string
		want bool
	}{
		{
			name: "add on empty array",
			s:    &Schema{},
			fKey: "K123123",
			want: false,
		},
		{
			name: "add on not empty array",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1", key: id.NewKey("K123123")}}},
			fKey: "K123123",
			want: true,
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1", key: id.NewKey("K123123")}, {id: fid2, name: "f2", key: id.NewKey("K111222")}, {id: fid3, name: "f3", key: id.NewKey("K123111")}}},
			fKey: "K123123",
			want: true,
		},
		{
			name: "add duplicated field",
			s:    &Schema{fields: []*Field{{id: fid1, name: "f1"}, {id: fid2, name: "f2"}, {id: fid3, name: "f3"}}},
			fKey: "K123123",
			want: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.s.HasFieldByKey(tc.fKey))
		})
	}
}

func TestSchema_CopyFrom(t *testing.T) {
	fid := id.NewFieldID()
	s1 := &Schema{id: id.NewSchemaID(), fields: []*Field{{id: id.NewFieldID(), name: "f1", key: id.RandomKey()}}, titleField: fid.Ref()}
	s2 := &Schema{id: id.NewSchemaID(), fields: []*Field{}}
	s2.CopyFrom(s1)
	assert.Equal(t, s1.fields, s2.fields)
	assert.Equal(t, s1.titleField, s2.titleField)

	s3 := &Schema{id: id.NewSchemaID(), fields: []*Field{}}
	s3.CopyFrom(nil)
	assert.Equal(t, 0, len(s3.fields))
	assert.Nil(t, s3.titleField)
}

func TestFieldFrom(t *testing.T) {
	schemaID := id.NewSchemaID()

	tests := []struct {
		name  string
		key   string
		value any
		want  GuessFieldData
	}{
		{
			name:  "string input",
			key:   "name",
			value: "hello",
			want: GuessFieldData{
				SchemaID: schemaID,
				Type:     value.TypeText,
				Name:     "name",
				Key:      "name",
			},
		},
		{
			name:  "bool input",
			key:   "active",
			value: true,
			want: GuessFieldData{
				SchemaID: schemaID,
				Type:     value.TypeBool,
				Name:     "active",
				Key:      "active",
			},
		},
		{
			name:  "int input",
			key:   "age",
			value: 42,
			want: GuessFieldData{
				SchemaID: schemaID,
				Type:     value.TypeNumber,
				Name:     "age",
				Key:      "age",
			},
		},
		{
			name:  "float input",
			key:   "height",
			value: 3.14,
			want: GuessFieldData{
				SchemaID: schemaID,
				Type:     value.TypeNumber,
				Name:     "height",
				Key:      "height",
			},
		},
		{
			name:  "nil value",
			key:   "empty",
			value: nil,
			want: GuessFieldData{
				SchemaID: schemaID,
				Type:     value.TypeText,
				Name:     "empty",
				Key:      "empty",
			},
		},
		{
			name:  "unsupported type (map)",
			key:   "meta",
			value: map[string]string{"k": "v"},
			want: GuessFieldData{
				SchemaID: schemaID,
				Type:     value.TypeText,
				Name:     "meta",
				Key:      "meta",
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := fieldFrom(tt.key, tt.value, schemaID)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestSchema_GuessSchemaFieldFromAssetFile(t *testing.T) {
	// Create a schema ID for testing
	schemaID := id.NewSchemaID()
	schema := &Schema{id: schemaID}

	// Define test cases
	tests := []struct {
		name      string
		jsonData  string
		isGeoJSON bool
		want      []GuessFieldData
		wantErr   bool
	}{
		{
			name: "flat JSON with various field types",
			jsonData: `[
                {
                    "name": "John Doe",
                    "age": 30,
                    "active": true,
                    "height": 1.85
                }
            ]`,
			isGeoJSON: false,
			want: []GuessFieldData{
				{SchemaID: schemaID, Type: value.TypeText, Name: "name", Key: "name"},
				{SchemaID: schemaID, Type: value.TypeInteger, Name: "age", Key: "age"},
				{SchemaID: schemaID, Type: value.TypeBool, Name: "active", Key: "active"},
				{SchemaID: schemaID, Type: value.TypeNumber, Name: "height", Key: "height"},
			},
			wantErr: false,
		},
		{
			name: "GeoJSON with point geometry",
			jsonData: `{
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [125.6, 10.1]
                        },
                        "properties": {
                            "name": "Location A",
                            "category": "Park",
                            "visitors": 1500
                        }
                    }
                ]
            }`,
			isGeoJSON: true,
			want: []GuessFieldData{
				{SchemaID: schemaID, Type: value.TypeGeometryObject, Name: "geometry", Key: "geometry"},
				{SchemaID: schemaID, Type: value.TypeText, Name: "name", Key: "name"},
				{SchemaID: schemaID, Type: value.TypeText, Name: "category", Key: "category"},
				{SchemaID: schemaID, Type: value.TypeInteger, Name: "visitors", Key: "visitors"},
			},
			wantErr: false,
		},
		{
			name:      "invalid JSON",
			jsonData:  `{invalid json`,
			isGeoJSON: false,
			want:      nil,
			wantErr:   true,
		},
		{
			name:      "empty JSON array",
			jsonData:  `[]`,
			isGeoJSON: false,
			want:      nil,
			wantErr:   true,
		},
		{
			name: "invalid GeoJSON (missing features)",
			jsonData: `{
                "type": "FeatureCollection"
            }`,
			isGeoJSON: true,
			want:      nil,
			wantErr:   true,
		},
		{
			name: "invalid GeoJSON (missing properties)",
			jsonData: `{
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [125.6, 10.1]
                        }
                    }
                ]
            }`,
			isGeoJSON: true,
			want:      nil,
			wantErr:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			// Create a ReadCloser from the JSON string
			file := io.NopCloser(strings.NewReader(tt.jsonData))

			// Call the function
			got, err := schema.GuessSchemaFieldFromAssetFile(file, tt.isGeoJSON)

			// Check error
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)

			// Compare the results
			assert.Equal(t, tt.want, got)
		})
	}
}

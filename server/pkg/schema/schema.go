package schema

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"

	"github.com/iancoleman/orderedmap"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

var ErrInvalidTitleField = errors.New("title field must be one of schema fields")

type Schema struct {
	id         ID
	project    ProjectID
	workspace  accountdomain.WorkspaceID
	fields     []*Field
	titleField *FieldID
}

func (s *Schema) ID() ID {
	return s.id
}

func (s *Schema) Workspace() accountdomain.WorkspaceID {
	return s.workspace
}

func (s *Schema) Project() ProjectID {
	return s.project
}

func (s *Schema) SetWorkspace(workspace accountdomain.WorkspaceID) {
	s.workspace = workspace
}

func (s *Schema) ReferencedSchemas() IDList {
	return lo.Map(s.FieldsByType(value.TypeReference), func(f *Field, _ int) ID {
		var sID ID
		f.TypeProperty().Match(TypePropertyMatch{
			Reference: func(rf *FieldReference) {
				sID = rf.Schema()
			},
		})
		return sID
	})
}

func (s *Schema) Groups() GroupIDList {
	return lo.Map(s.FieldsByType(value.TypeGroup), func(f *Field, _ int) id.GroupID {
		var gID id.GroupID
		f.TypeProperty().Match(TypePropertyMatch{
			Group: func(f *FieldGroup) {
				gID = f.Group()
			},
		})
		return gID
	})
}

func (s *Schema) HasField(f FieldID) bool {
	return lo.SomeBy(s.fields, func(g *Field) bool { return g.ID() == f })
}

func (s *Schema) HasFieldByKey(k string) bool {
	return lo.SomeBy(s.fields, func(g *Field) bool { return g.Key().String() == k })
}

func (s *Schema) AddField(f *Field) {
	if s.HasField(f.ID()) {
		return
	}
	if s.Fields().Count() == 0 {
		f.order = 0
	} else {
		// get the biggest order
		f.order = s.Fields().Ordered()[s.Fields().Count()-1].Order() + 1
	}
	s.fields = append(s.fields, f)
}

func (s *Schema) Field(fId FieldID) *Field {
	f, _ := lo.Find(s.fields, func(f *Field) bool { return f.id == fId })
	return f
}

func (s *Schema) FieldByIDOrKey(fId *FieldID, key *id.Key) *Field {
	if s == nil || s.fields == nil {
		return nil
	}
	f, _ := lo.Find(s.fields, func(f *Field) bool {
		return fId != nil && f.id == *fId || key != nil && key.IsValid() && f.key == *key
	})
	return f
}

func (s *Schema) Fields() FieldList {
	var fl FieldList = slices.Clone(s.fields)
	return fl.Ordered()
}

func (s *Schema) FieldsByType(t value.Type) FieldList {
	return lo.Filter(s.Fields(), func(f *Field, _ int) bool {
		return f.Type() == t
	})
}

func (s *Schema) RemoveField(fid FieldID) {
	for i, field := range s.fields {
		if field.id == fid {
			s.fields = slices.Delete(s.fields, i, i+1)
			if lo.FromPtr(s.titleField) == fid {
				s.titleField = nil
			}
			return
		}
	}
}

func (s *Schema) TitleField() *FieldID {
	if s.Fields() == nil || len(s.Fields()) == 0 {
		return nil
	}
	return s.titleField.CloneRef()
}

func (s *Schema) SetTitleField(tf *FieldID) error {
	// unsetting title
	if tf == nil {
		s.titleField = nil
		return nil
	}

	if !s.HasField(*tf) || s.Fields() == nil || len(s.Fields()) == 0 {
		return ErrInvalidTitleField
	}
	s.titleField = tf.CloneRef()
	return nil
}

func (s *Schema) Clone() *Schema {
	if s == nil {
		return nil
	}

	return &Schema{
		id:         s.ID(),
		project:    s.Project().Clone(),
		workspace:  s.Workspace().Clone(),
		fields:     slices.Clone(s.fields),
		titleField: s.TitleField().CloneRef(),
	}
}

func (s *Schema) HasGeometryFields() bool {
	if s == nil {
		return false
	}
	return len(s.FieldsByType(value.TypeGeometryObject)) > 0 || len(s.FieldsByType(value.TypeGeometryEditor)) > 0
}

func (s *Schema) IsPointFieldSupported() bool {
	if s == nil {
		return false
	}
	for _, f := range s.Fields() {
		if f.SupportsPointField() {
			return true
		}
	}
	return false
}

func (s *Schema) CopyFrom(s2 *Schema) {
	if s == nil || s2 == nil {
		return
	}
	s.fields = slices.Clone(s2.fields)
	s.titleField = s2.TitleField().CloneRef()
}

type GuessFieldData struct {
	SchemaID id.SchemaID
	Type     value.Type
	Name     string
	Key      string
}

func (s *Schema) GuessSchemaFieldFromAssetFile(file io.ReadCloser, isGeoJSON bool) ([]GuessFieldData, error) {
	defer func() {
		if err := file.Close(); err != nil {
			fmt.Printf("warning: failed to close file: %v", err)
		}
	}()
	decoder := json.NewDecoder(file)

	if isGeoJSON {
		return guessFromGeoJSON(decoder, s.ID())
	} else {
		return guessFromFlatJSON(decoder, s.ID())
	}
}

func guessFromGeoJSON(decoder *json.Decoder, schemaID id.SchemaID) ([]GuessFieldData, error) {
	// Expect opening object {
	tok, err := decoder.Token()
	if err != nil {
		return nil, fmt.Errorf("expected opening '{': %w", err)
	}
	if delim, ok := tok.(json.Delim); !ok || delim != '{' {
		return nil, fmt.Errorf("expected '{', got %v", tok)
	}

	// Scan to "features"
	for decoder.More() {
		tok, err := decoder.Token()
		if err != nil {
			return nil, fmt.Errorf("error reading token: %w", err)
		}
		key, ok := tok.(string)
		if !ok {
			continue
		}
		if key == "features" {
			tok, err := decoder.Token()
			if err != nil {
				return nil, fmt.Errorf("expected '[' after 'features': %w", err)
			}
			if delim, ok := tok.(json.Delim); !ok || delim != '[' {
				return nil, fmt.Errorf("expected '[' but got %v", tok)
			}
			break
		}
		var discard interface{}
		_ = decoder.Decode(&discard)
	}

	// Decode first feature only
	var raw json.RawMessage
	if err := decoder.Decode(&raw); err != nil {
		return nil, fmt.Errorf("error decoding raw feature: %w", err)
	}

	orderedMap := orderedmap.New()
	if err := json.Unmarshal(raw, &orderedMap); err != nil {
		return nil, fmt.Errorf("error decoding JSON object: %v", err)
	}

	// Drill into properties
	properties, ok := orderedMap.Get("properties")
	if !ok {
		return nil, fmt.Errorf("missing 'properties' in GeoJSON feature")
	}
	propsMap, ok := properties.(orderedmap.OrderedMap)
	if !ok {
		return nil, fmt.Errorf("invalid properties map type")
	}

	fields := make([]GuessFieldData, 0)
	// Add geometry field
	fields = append(fields, GuessFieldData{
		SchemaID: schemaID,
		Type:     value.TypeGeometryObject,
		Name:     "geometry",
		Key:      "geometry",
	})

	for _, k := range propsMap.Keys() {
		v, _ := propsMap.Get(k)
		if k == "id" {
			continue
		}
		key := id.NewKey(k)
		if !key.IsValid() {
			return nil, rerror.ErrInvalidParams
		}
		fields = append(fields, fieldFrom(key.String(), v, schemaID))
	}

	return fields, nil
}

func guessFromFlatJSON(decoder *json.Decoder, schemaID id.SchemaID) ([]GuessFieldData, error) {
	// Decode just the first object from a JSON array
	tok, err := decoder.Token()
	if err != nil {
		return nil, fmt.Errorf("failed to read token: %w", err)
	}
	if delim, ok := tok.(json.Delim); !ok || delim != '[' {
		return nil, fmt.Errorf("expected '[' at start of array, got %v", tok)
	}

	if !decoder.More() {
		return nil, fmt.Errorf("JSON array is empty")
	}

	var raw json.RawMessage
	if err := decoder.Decode(&raw); err != nil {
		return nil, fmt.Errorf("failed to decode first object in array: %w", err)
	}

	orderedMap := orderedmap.New()
	if err := json.Unmarshal(raw, &orderedMap); err != nil {
		return nil, fmt.Errorf("error decoding JSON object: %v", err)
	}

	fields := make([]GuessFieldData, 0)
	for _, k := range orderedMap.Keys() {
		v, _ := orderedMap.Get(k)
		if k == "id" {
			continue
		}
		key := id.NewKey(k)
		if !key.IsValid() {
			return nil, rerror.ErrInvalidParams
		}
		fields = append(fields, fieldFrom(key.String(), v, schemaID))
	}
	return fields, nil
}

func fieldFrom(k string, v any, schemaID id.SchemaID) GuessFieldData {
	t := value.TypeText
	if v != nil {
		switch val := v.(type) {
		case bool:
			t = value.TypeBool
		case int,
			int8,
			int16,
			int32,
			int64,
			uint,
			uint8,
			uint16,
			uint32,
			uint64:
			t = value.TypeNumber
		case float32:
			if math.Trunc(float64(val)) == float64(val) {
				t = value.TypeInteger
			} else {
				t = value.TypeNumber
			}
		case float64:
			if math.Trunc(val) == val {
				t = value.TypeInteger
			} else {
				t = value.TypeNumber
			}
		case string:
			t = value.TypeText
		default:
			t = value.TypeText
		}
	}
	return GuessFieldData{
		SchemaID: schemaID,
		Type:     t,
		Name:     k,
		Key:      k,
	}
}

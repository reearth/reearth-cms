package schema

import (
	"encoding/json"
	"fmt"
	"io"
	"math"

	"github.com/iancoleman/orderedmap"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

type GuessFieldData struct {
	Type value.Type
	Name string
	Key  string
}

func (s *Schema) GuessSchemaFieldFromJson(file io.Reader, isGeoJSON, appendGeoField bool) ([]GuessFieldData, error) {
	decoder := json.NewDecoder(file)

	if isGeoJSON {
		// Skip tokens until we find "features"
		for {
			token, err := decoder.Token()
			if err != nil {
				return nil, fmt.Errorf("error reading token: %v", err)
			}
			if str, ok := token.(string); ok && str == "features" {
				break
			}
		}
	}

	// Read the opening bracket of array
	if t, err := decoder.Token(); err != nil || t != json.Delim('[') {
		if err != nil {
			return nil, fmt.Errorf("error reading array start: %v", err)
		}
		return nil, fmt.Errorf("expected '[', got %v", t)
	}

	orderedMap := orderedmap.New()
	if err := decoder.Decode(&orderedMap); err != nil {
		return nil, fmt.Errorf("error decoding JSON object: %v", err)
	}

	fields, err := s.guessFromOrderedMap(orderedMap, isGeoJSON)
	if err != nil {
		return nil, err
	}

	if isGeoJSON && appendGeoField {
		fields = append([]GuessFieldData{{
			Type: value.TypeGeometryObject,
			Name: "geometry",
			Key:  "geometry",
		}}, fields...)
	}

	return fields, nil
}

func (s *Schema) guessFromOrderedMap(orderedMap *orderedmap.OrderedMap, isGeoJson bool) ([]GuessFieldData, error) {
	fields := make([]GuessFieldData, 0)
	if isGeoJson {
		properties, ok := orderedMap.Get("properties")
		if !ok {
			return nil, rerror.ErrInvalidParams
		}
		orderedMap = lo.ToPtr(properties.(orderedmap.OrderedMap))
	}
	for _, k := range orderedMap.Keys() {
		v, _ := orderedMap.Get(k)
		if k == "id" {
			continue
		}

		key := id.NewKey(k)
		if !key.IsValid() {
			return nil, rerror.ErrInvalidParams
		}
		newField := fieldFrom(key.String(), v)
		f := s.FieldByIDOrKey(nil, &key)
		if f != nil && !isAssignable(newField.Type, f.Type()) {
			continue
		}

		if f == nil {
			prevField, found := lo.Find(fields, func(fp GuessFieldData) bool {
				return fp.Key == key.String()
			})
			if found && prevField.Type != newField.Type {
				return nil, rerror.NewE(i18n.T("data type mismatch"))
			}
			if !found {
				fields = append(fields, newField)
			}
		}

	}
	return fields, nil
}

func fieldFrom(k string, v any) GuessFieldData {
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
		Type: t,
		Name: k,
		Key:  k,
	}
}

func isAssignable(valueType, fieldType value.Type) bool {
	if valueType == fieldType {
		return true
	}
	if valueType == value.TypeInteger &&
		(fieldType == value.TypeText || fieldType == value.TypeRichText || fieldType == value.TypeMarkdown || fieldType == value.TypeNumber) {
		return true
	}
	if valueType == value.TypeNumber &&
		(fieldType == value.TypeText || fieldType == value.TypeRichText || fieldType == value.TypeMarkdown) {
		return true
	}
	if valueType == value.TypeBool &&
		(fieldType == value.TypeCheckbox || fieldType == value.TypeText || fieldType == value.TypeRichText || fieldType == value.TypeMarkdown) {
		return true
	}
	if valueType == value.TypeText &&
		(fieldType == value.TypeText || fieldType == value.TypeRichText || fieldType == value.TypeMarkdown) {
		return true
	}
	return false
}

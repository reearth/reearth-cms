package item

import (
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func buildValidationTestField(key string, tp *schema.TypeProperty, required bool) *schema.Field {
	return schema.NewField(tp).NewID().Key(id.NewKey(key)).Name(key).Required(required).MustBuild()
}

func buildValidationTestFieldMultiple(key string, tp *schema.TypeProperty, required bool) *schema.Field {
	return schema.NewField(tp).NewID().Key(id.NewKey(key)).Name(key).Required(required).Multiple(true).MustBuild()
}

func buildValidationTestSchema(fields ...*schema.Field) *schema.Schema {
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	return schema.New().NewID().Workspace(wid).Project(pid).Fields(fields).MustBuild()
}

func TestValidateItem(t *testing.T) {
	t.Parallel()

	titleField := buildValidationTestField("title", schema.NewText(nil).TypeProperty(), true)
	statusField := buildValidationTestField("status", schema.NewSelect([]string{"open", "closed"}).TypeProperty(), false)
	locationField := buildValidationTestField("location", schema.NewGeometryObject(schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint}).TypeProperty(), false)
	minCount, maxCount := int64(1), int64(10)
	countField := buildValidationTestField("count", schema.MustNewInteger(&minCount, &maxCount).TypeProperty(), false)
	numberField, err := schema.NewNumber(nil, nil)
	require.NoError(t, err)
	scoreField := buildValidationTestField("score", numberField.TypeProperty(), false)
	activeField := buildValidationTestField("active", schema.NewBool().TypeProperty(), false)
	websiteField := buildValidationTestField("website", schema.NewURL().TypeProperty(), false)
	s := buildValidationTestSchema(titleField, statusField, locationField, countField, scoreField, activeField, websiteField)
	sp := schema.NewPackage(s, nil, nil, nil)

	metaStatusField := buildValidationTestField("docStatus", schema.NewText(nil).TypeProperty(), true)
	metaSchema := buildValidationTestSchema(metaStatusField)
	spWithMeta := schema.NewPackage(s, metaSchema, nil, nil)
	spNoMeta := schema.NewPackage(s, nil, nil, nil)

	subtitleField := buildValidationTestField("subtitle", schema.NewText(nil).TypeProperty(), true)
	sMultiRequired := buildValidationTestSchema(titleField, subtitleField)
	spMultiRequired := schema.NewPackage(sMultiRequired, nil, nil, nil)

	requiredLocationField := buildValidationTestField("requiredLocation", schema.NewGeometryObject(schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint}).TypeProperty(), true)
	sRequiredGeo := buildValidationTestSchema(requiredLocationField)
	spRequiredGeo := schema.NewPackage(sRequiredGeo, nil, nil, nil)

	tests := []struct {
		name       string
		fields     Fields
		sp         *schema.Package
		isMetadata bool
		wantCodes  map[string]schema.FieldValidationCode
	}{
		{
			name: "valid item passes",
			fields: Fields{
				NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
			},
			sp: sp,
		},
		{
			name:      "required field absent with no default fails",
			fields:    Fields{},
			sp:        sp,
			wantCodes: map[string]schema.FieldValidationCode{"title": schema.FieldValidationCodeRequired},
		},
		{
			name: "invalid value wrapped as constraint violation",
			fields: Fields{
				NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
				NewField(statusField.ID(), value.TypeSelect.Value("pending").AsMultiple(), nil),
			},
			sp:        sp,
			wantCodes: map[string]schema.FieldValidationCode{"status": schema.FieldValidationCodeConstraint},
		},
		{
			name:       "metadata item is validated against the metadata schema only",
			fields:     Fields{},
			sp:         spWithMeta,
			isMetadata: true,
			wantCodes:  map[string]schema.FieldValidationCode{"docStatus": schema.FieldValidationCodeRequired},
		},
		{
			name:   "nil package skips validation",
			fields: Fields{},
			sp:     nil,
		},
		{
			name:       "metadata requested but package has no metadata schema skips validation",
			fields:     Fields{},
			sp:         spNoMeta,
			isMetadata: true,
		},
		{
			name: "unknown field not present in schema is ignored",
			fields: Fields{
				NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
				NewField(id.NewFieldID(), value.TypeText.Value("stray").AsMultiple(), nil),
			},
			sp: sp,
		},
		{
			name:      "multiple missing required fields are all reported",
			fields:    Fields{},
			sp:        spMultiRequired,
			wantCodes: map[string]schema.FieldValidationCode{"title": schema.FieldValidationCodeRequired, "subtitle": schema.FieldValidationCodeRequired},
		},
		{
			name: "well-formed JSON with an unsupported geometry type fails as constraint violation",
			fields: Fields{
				NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
				NewField(locationField.ID(), value.TypeGeometryObject.Value(`{"type": "LineString", "coordinates": [[102.0, 0.5], [103.0, 1.5]]}`).AsMultiple(), nil),
			},
			sp:        sp,
			wantCodes: map[string]schema.FieldValidationCode{"location": schema.FieldValidationCodeConstraint},
		},
		{
			// value.TypeGeometryObject.Value rejects any input that isn't syntactically valid JSON,
			// so a truncated/garbled payload never becomes a value at all: it collapses to an empty
			// field rather than surfacing as a constraint violation. Raw user input is checked
			// earlier by schema.Field.ParseValue, which reports it as a type mismatch.
			name: "malformed JSON on an optional geometry field is silently dropped, not reported",
			fields: Fields{
				NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
				NewField(locationField.ID(), value.TypeGeometryObject.Value(`{"type": "Point", "coordinates": [102.0, 0.5]`).AsMultiple(), nil),
			},
			sp: sp,
		},
		{
			name: "malformed JSON on a required geometry field is reported as missing, not as invalid JSON",
			fields: Fields{
				NewField(requiredLocationField.ID(), value.TypeGeometryObject.Value("not-json-at-all").AsMultiple(), nil),
			},
			sp:        spRequiredGeo,
			wantCodes: map[string]schema.FieldValidationCode{"requiredLocation": schema.FieldValidationCodeRequired},
		},
		{
			name: "integer value outside allowed range fails as constraint violation",
			fields: Fields{
				NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
				NewField(countField.ID(), value.TypeInteger.Value(int64(100)).AsMultiple(), nil),
			},
			sp:        sp,
			wantCodes: map[string]schema.FieldValidationCode{"count": schema.FieldValidationCodeConstraint},
		},
		{
			name: "string value assigned to a number field fails as constraint violation",
			fields: Fields{
				NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
				NewField(scoreField.ID(), value.TypeText.Value("not-a-number").AsMultiple(), nil),
			},
			sp:        sp,
			wantCodes: map[string]schema.FieldValidationCode{"score": schema.FieldValidationCodeConstraint},
		},
		{
			name: "string value assigned to an integer field fails as constraint violation",
			fields: Fields{
				NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
				NewField(countField.ID(), value.TypeText.Value("not-a-number").AsMultiple(), nil),
			},
			sp:        sp,
			wantCodes: map[string]schema.FieldValidationCode{"count": schema.FieldValidationCodeConstraint},
		},
		{
			name: "string value assigned to a boolean field fails as constraint violation",
			fields: Fields{
				NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
				NewField(activeField.ID(), value.TypeText.Value("yes").AsMultiple(), nil),
			},
			sp:        sp,
			wantCodes: map[string]schema.FieldValidationCode{"active": schema.FieldValidationCodeConstraint},
		},
		{
			name: "integer value assigned to a text field fails as constraint violation",
			fields: Fields{
				NewField(titleField.ID(), value.TypeInteger.Value(int64(42)).AsMultiple(), nil),
			},
			sp:        sp,
			wantCodes: map[string]schema.FieldValidationCode{"title": schema.FieldValidationCodeConstraint},
		},
		{
			name: "URL over the length limit keeps its specific code",
			fields: Fields{
				NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
				NewField(websiteField.ID(), value.TypeURL.Value("https://e.com/"+strings.Repeat("a", 2048)).AsMultiple(), nil),
			},
			sp:        sp,
			wantCodes: map[string]schema.FieldValidationCode{"website": schema.FieldValidationCodeMaxLengthExceeded},
		},
		{
			name: "geometry over the size limit keeps its specific code",
			fields: Fields{
				NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
				NewField(locationField.ID(), value.TypeGeometryObject.Value(`{"type":"Point","coordinates":[1,2],"pad":"`+strings.Repeat("a", 10*1024)+`"}`).AsMultiple(), nil),
			},
			sp:        sp,
			wantCodes: map[string]schema.FieldValidationCode{"location": schema.FieldValidationCodeMaxSizeExceeded},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			errs := ValidateItem(tt.fields, tt.sp, tt.isMetadata, nil)

			if tt.wantCodes == nil {
				assert.Empty(t, errs)
				return
			}
			require.Len(t, errs, len(tt.wantCodes))
			for _, fe := range errs {
				wantCode, exists := tt.wantCodes[fe.Key.String()]
				assert.True(t, exists, "unexpected field error for %q", fe.Key)
				assert.Equal(t, wantCode, fe.Code)
			}
		})
	}
}

func TestValidateItem_Group(t *testing.T) {
	t.Parallel()

	subtitleField := buildValidationTestField("subtitle", schema.NewText(nil).TypeProperty(), true)
	groupSchema := buildValidationTestSchema(subtitleField)
	gid := id.NewGroupID()

	t.Run("required field missing inside one group instance", func(t *testing.T) {
		t.Parallel()

		sectionField := buildValidationTestField("section", schema.NewGroup(gid).TypeProperty(), false)
		s := buildValidationTestSchema(sectionField)
		sp := schema.NewPackage(s, nil, map[id.GroupID]*schema.Schema{gid: groupSchema}, nil)

		instanceID := id.NewItemGroupID()
		fields := Fields{
			NewField(sectionField.ID(), value.NewMultiple(value.TypeGroup, []any{instanceID}), nil),
			// no "subtitle" field for instanceID
		}

		errs := ValidateItem(fields, sp, false, nil)
		require.Len(t, errs, 1)
		assert.Equal(t, "subtitle", errs[0].Key.String())
		assert.Equal(t, schema.FieldValidationCodeRequired, errs[0].Code)
		assert.Equal(t, &instanceID, errs[0].Group)
	})

	t.Run("multiple-value group: one valid instance, one invalid instance", func(t *testing.T) {
		t.Parallel()

		sectionsField := buildValidationTestFieldMultiple("sections", schema.NewGroup(gid).TypeProperty(), false)
		s := buildValidationTestSchema(sectionsField)
		sp := schema.NewPackage(s, nil, map[id.GroupID]*schema.Schema{gid: groupSchema}, nil)

		validInstance, invalidInstance := id.NewItemGroupID(), id.NewItemGroupID()
		fields := Fields{
			NewField(sectionsField.ID(), value.NewMultiple(value.TypeGroup, []any{validInstance, invalidInstance}), nil),
			NewField(subtitleField.ID(), value.TypeText.Value("hello").AsMultiple(), &validInstance),
			// invalidInstance has no "subtitle" field
		}

		errs := ValidateItem(fields, sp, false, nil)
		require.Len(t, errs, 1)
		assert.Equal(t, "subtitle", errs[0].Key.String())
		assert.Equal(t, schema.FieldValidationCodeRequired, errs[0].Code)
		assert.Equal(t, &invalidInstance, errs[0].Group)
	})

	t.Run("skipped group instance field is not reported again", func(t *testing.T) {
		t.Parallel()

		sectionField := buildValidationTestField("section", schema.NewGroup(gid).TypeProperty(), false)
		s := buildValidationTestSchema(sectionField)
		sp := schema.NewPackage(s, nil, map[id.GroupID]*schema.Schema{gid: groupSchema}, nil)

		instanceID := id.NewItemGroupID()
		fields := Fields{
			NewField(sectionField.ID(), value.NewMultiple(value.TypeGroup, []any{instanceID}), nil),
		}
		skip := schema.FieldKeySet{schema.NewFieldKey(subtitleField.ID(), &instanceID): {}}

		assert.Empty(t, ValidateItem(fields, sp, false, skip))
		// the same field at top level is a different key, so it isn't skipped by a group-scoped key
		assert.False(t, skip.Has(subtitleField.ID(), nil))
	})
}

func TestValidateItem_SkipAndIndex(t *testing.T) {
	t.Parallel()

	titleField := buildValidationTestField("title", schema.NewText(nil).TypeProperty(), true)
	maxCount := int64(100)
	countsField := buildValidationTestFieldMultiple("counts", schema.MustNewInteger(nil, &maxCount).TypeProperty(), false)
	sp := schema.NewPackage(buildValidationTestSchema(titleField, countsField), nil, nil, nil)

	t.Run("field with an earlier error gets no extra required error", func(t *testing.T) {
		t.Parallel()

		skip := schema.FieldKeySet{schema.NewFieldKey(titleField.ID(), nil): {}}
		assert.Empty(t, ValidateItem(Fields{}, sp, false, skip))
	})

	t.Run("every failing element of a multiple field is reported with its index", func(t *testing.T) {
		t.Parallel()

		fields := Fields{
			NewField(titleField.ID(), value.TypeText.Value("hello").AsMultiple(), nil),
			NewField(countsField.ID(), value.NewMultiple(value.TypeInteger, []any{int64(200), int64(5), int64(300)}), nil),
		}
		errs := ValidateItem(fields, sp, false, nil)
		require.Len(t, errs, 2)
		for i, want := range []int{0, 2} {
			assert.Equal(t, schema.FieldValidationCodeConstraint, errs[i].Code)
			assert.Equal(t, &want, errs[i].Index)
			assert.Nil(t, errs[i].Group)
		}
	})
}

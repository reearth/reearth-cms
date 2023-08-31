package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestGetCorrespondingFields(t *testing.T) {
	prj := project.New().NewID().MustBuild()
	mid1 := id.NewModelID()
	mid2 := id.NewModelID()
	fid1 := id.NewFieldID()
	cf1 := &CorrespondingField{
		Title:       lo.ToPtr("title"),
		Key:         lo.ToPtr("key"),
		Description: lo.ToPtr("description"),
		Required:    lo.ToPtr(true),
	}
	f1 := NewField(NewReference(mid2, cf1, cf1.FieldID).TypeProperty()).ID(fid1).Key(key.Random()).MustBuild()
	s1 := New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(FieldList{f1}).MustBuild()
	s2 := New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(FieldList{}).MustBuild()
	fr1, _ := FieldReferenceFromTypeProperty(f1.TypeProperty())
	fields, _ := GetCorrespondingFields(s1, s2, mid1, f1, fr1)

	// check that fields are not nil
	assert.NotNil(t, fields.Schema1)
	assert.NotNil(t, fields.Schema2)
	assert.NotNil(t, fields.Field1)
	assert.NotNil(t, fields.Field2)

	// check that model ids are correct
	assert.Equal(t, fields.Field2.typeProperty.reference.modelId, mid1)
	assert.Equal(t, fields.Field1.typeProperty.reference.modelId, mid2)

	// check that corresponding field ids are correct
	assert.Equal(t, fields.Field1.typeProperty.reference.correspondingFieldId, fields.Field2.ID().Ref())
	assert.Equal(t, fields.Field2.typeProperty.reference.correspondingFieldId, fields.Field1.ID().Ref())

	// check that corresponding field is set correctly
	wantcf2 := &CorrespondingField{
		FieldID:     f1.ID().Ref(),
		Title:       lo.ToPtr(f1.Name()),
		Key:         lo.ToPtr(f1.Key().String()),
		Description: lo.ToPtr(f1.Description()),
		Required:    lo.ToPtr(f1.Required()),
	}
	fr2, ok := FieldReferenceFromTypeProperty(fields.Field2.TypeProperty())
	assert.True(t, ok)
	assert.Equal(t, wantcf2, fr2.correspondingField)
	
	// check invalid key
	cf3 := &CorrespondingField{
		Title:       lo.ToPtr("title"),
		Key:         nil,
		Description: lo.ToPtr("description"),
		Required:    lo.ToPtr(true),
	}
	f3 := NewField(NewReference(mid2, cf3, cf3.FieldID).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	s3 := New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(FieldList{f3}).MustBuild()
	s4 := New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(prj.ID()).Fields(FieldList{}).MustBuild()

	mid3 := id.NewModelID()
	fr3, _ := FieldReferenceFromTypeProperty(f3.TypeProperty())
	fields, err := GetCorrespondingFields(s3, s4, mid3, f3, fr3)
	assert.Nil(t, fields)
	assert.Equal(t, err, ErrInvalidKey)
	
	// check one way reference
	mid4 := id.NewModelID()
	f4 := NewField(NewReference(mid2, nil, nil).TypeProperty()).NewID().Key(key.Random()).MustBuild()
	fr4, _ := FieldReferenceFromTypeProperty(f4.TypeProperty())
	fields, err = GetCorrespondingFields(s3, s4, mid4, f4, fr4)
	assert.Nil(t, fields)
	assert.Nil(t, err)
}

func TestFieldReferenceFromTypeProperty(t *testing.T) {
	// check that it returns true and correct field reference if type is reference
	mid1 := id.NewModelID()
	fid1 := id.NewFieldID()
	f1 := NewField(NewReference(mid1, nil, nil).TypeProperty()).ID(fid1).Key(key.Random()).MustBuild()
	got1, ok := FieldReferenceFromTypeProperty(f1.TypeProperty())
	want1 := &FieldReference{
		modelId  : mid1,
		correspondingFieldId: nil,
		correspondingField : nil,
	}
	assert.True(t, ok)
	assert.Equal(t, want1, got1)

	// check that it returns false and nil if type is not reference
	fid2 := id.NewFieldID()
	f2 := NewField(NewText(nil).TypeProperty()).ID(fid2).Key(key.Random()).MustBuild()
	got2, ok := FieldReferenceFromTypeProperty(f2.TypeProperty())
	assert.False(t, ok)
	assert.Nil(t, got2)
}
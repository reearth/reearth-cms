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
}

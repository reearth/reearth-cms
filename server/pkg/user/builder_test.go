package user

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/workspace"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestNew(t *testing.T) {
	var tb = New()
	assert.NotNil(t, tb)
	assert.NotNil(t, tb.u)
}

func TestBuilder_ID(t *testing.T) {
	id := NewID()
	tb := New()
	res := tb.ID(id).Name("test").Email("test@example.com").MustBuild()
	assert.Equal(t, id, res.ID())
}

func TestBuilder_NewID(t *testing.T) {
	tb := New()
	res := tb.NewID().Name("test").Email("test@example.com").MustBuild()
	assert.False(t, res.ID().IsEmpty())
}

func TestBuilder_Name(t *testing.T) {
	tb := New().NewID()
	res := tb.Name("John Doe").Email("test@example.com").MustBuild()
	assert.Equal(t, "John Doe", res.Name())
}

func TestBuilder_Email(t *testing.T) {
	tb := New().NewID()
	res := tb.Name("test").Email("john@example.com").MustBuild()
	assert.Equal(t, "john@example.com", res.Email())
}

func TestBuilder_Metadata(t *testing.T) {
	metadata := Metadata{
		description: "Test description",
		photoURL:    "https://example.com/photo.jpg",
		theme:       "dark",
		website:     "https://example.com",
		lang:        language.English,
	}
	tb := New().NewID()
	res := tb.Name("test").Email("test@example.com").Metadata(metadata).MustBuild()
	assert.Equal(t, metadata, res.Metadata())
}

func TestBuilder_Workspaces(t *testing.T) {
	workspaceList := workspace.WorkspaceList{}
	tb := New().NewID()
	res := tb.Name("test").Email("test@example.com").Workspaces(workspaceList).MustBuild()
	assert.Equal(t, workspaceList, res.Workspaces())
}

func TestBuilder_Build_Success(t *testing.T) {
	id := NewID()
	metadata := Metadata{
		description: "Test user",
		photoURL:    "https://example.com/photo.jpg",
		theme:       "light",
		website:     "https://example.com",
		lang:        language.English,
	}
	workspaceList := workspace.WorkspaceList{}

	tb := New()
	user, err := tb.
		ID(id).
		Name("John Doe").
		Email("john@example.com").
		Metadata(metadata).
		Workspaces(workspaceList).
		Build()

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, id, user.ID())
	assert.Equal(t, "John Doe", user.Name())
	assert.Equal(t, "john@example.com", user.Email())
	assert.Equal(t, metadata, user.Metadata())
	assert.Equal(t, workspaceList, user.Workspaces())
}

func TestBuilder_Build_ErrorInvalidID(t *testing.T) {
	tb := New()
	user, err := tb.
		Name("John Doe").
		Email("john@example.com").
		Build()

	assert.Error(t, err)
	assert.Equal(t, ErrInvalidID, err)
	assert.Nil(t, user)
}

func TestBuilder_Build_ErrorInvalidName(t *testing.T) {
	tb := New()
	user, err := tb.
		NewID().
		Email("john@example.com").
		Build()

	assert.Error(t, err)
	assert.Equal(t, ErrInvalidName, err)
	assert.Nil(t, user)
}

func TestBuilder_Build_ErrorInvalidEmail(t *testing.T) {
	tb := New()
	user, err := tb.
		NewID().
		Name("John Doe").
		Build()

	assert.Error(t, err)
	assert.Equal(t, ErrInvalidEmail, err)
	assert.Nil(t, user)
}

func TestBuilder_Build_DefaultTimestamps(t *testing.T) {
	id := NewID()
	tb := New()
	user, err := tb.
		ID(id).
		Name("John Doe").
		Email("john@example.com").
		Build()

	assert.NoError(t, err)
	assert.NotNil(t, user)
}

func TestBuilder_MustBuild_Success(t *testing.T) {
	tb := New()
	user := tb.
		NewID().
		Name("John Doe").
		Email("john@example.com").
		MustBuild()

	assert.NotNil(t, user)
	assert.Equal(t, "John Doe", user.Name())
	assert.Equal(t, "john@example.com", user.Email())
}

func TestBuilder_MustBuild_Panic(t *testing.T) {
	tb := New()
	assert.Panics(t, func() {
		tb.MustBuild()
	})
}

func TestBuilder_Chaining(t *testing.T) {
	// Test method chaining
	tb := New()
	result := tb.NewID().Name("test").Email("test@example.com")
	assert.Equal(t, tb, result)
}

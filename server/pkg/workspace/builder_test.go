package workspace

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNew(t *testing.T) {
	var tb = New()
	assert.NotNil(t, tb)
	assert.NotNil(t, tb.a)
}

func TestBuilder_ID(t *testing.T) {
	id := NewID()
	tb := New()
	res := tb.ID(id).Name("test").MustBuild()
	assert.Equal(t, id, res.ID())
}

func TestBuilder_NewID(t *testing.T) {
	tb := New()
	res := tb.NewID().Name("test").MustBuild()
	assert.False(t, res.ID().IsEmpty())
}

func TestBuilder_Name(t *testing.T) {
	tb := New().NewID()
	res := tb.Name("Test Workspace").MustBuild()
	assert.Equal(t, "Test Workspace", res.Name())
}

func TestBuilder_Alias(t *testing.T) {
	tb := New().NewID()
	res := tb.Name("test").Alias("test-workspace").MustBuild()
	assert.Equal(t, "test-workspace", res.Alias())
}

func TestBuilder_Metadata(t *testing.T) {
	metadata := Metadata{
		description: "Test description",
		photoURL:    "https://example.com/photo.jpg",
		website:     "https://example.com",
	}
	tb := New().NewID()
	res := tb.Name("test").Metadata(metadata).MustBuild()
	assert.Equal(t, metadata, res.Metadata())
}

func TestBuilder_Personal(t *testing.T) {
	tb := New().NewID()
	res := tb.Name("test").Personal(true).MustBuild()
	assert.True(t, res.Personal())
}

func TestBuilder_Member(t *testing.T) {
	member := UserMember{
		UserID: NewUserID(),
		Role:   RoleReader,
	}
	tb := New().NewID()
	res := tb.Name("test").Member(member).MustBuild()
	assert.Equal(t, member, res.Member())
}

func TestBuilder_Build_Success(t *testing.T) {
	id := NewID()
	metadata := Metadata{
		description: "Test workspace",
		photoURL:    "https://example.com/photo.jpg",
		website:     "https://example.com",
	}

	tb := New()
	workspace, err := tb.
		ID(id).
		Name("Test Workspace").
		Alias("test-workspace").
		Metadata(metadata).
		Personal(false).
		Build()

	assert.NoError(t, err)
	assert.NotNil(t, workspace)
	assert.Equal(t, id, workspace.ID())
	assert.Equal(t, "Test Workspace", workspace.Name())
	assert.Equal(t, "test-workspace", workspace.Alias())
	assert.Equal(t, metadata, workspace.Metadata())
	assert.False(t, workspace.Personal())
}

func TestBuilder_Build_ErrorInvalidAlias(t *testing.T) {
	tb := New()
	// Invalid alias: too short
	_, err := tb.NewID().Name("test").Alias("ab").Build()
	assert.Equal(t, ErrInvalidAlias, err)

	// Invalid alias: contains invalid characters
	_, err = tb.NewID().Name("test").Alias("workspace@name").Build()
	assert.Equal(t, ErrInvalidAlias, err)

	// Invalid alias: too long
	_, err = tb.NewID().Name("test").Alias("thisaliasistoolongandexceeds32characters").Build()
	assert.Equal(t, ErrInvalidAlias, err)
}

func TestBuilder_Build_ValidAlias(t *testing.T) {
	tb := New()
	// Valid alias
	workspace, err := tb.NewID().Name("test").Alias("valid_alias-123").Build()
	assert.NoError(t, err)
	assert.Equal(t, "valid_alias-123", workspace.Alias())

	// Empty alias should be valid (optional field)
	workspace, err = tb.NewID().Name("test2").Alias("").Build()
	assert.NoError(t, err)
	assert.Equal(t, "", workspace.Alias())
}

func TestBuilder_MustBuild_Success(t *testing.T) {
	tb := New()
	workspace := tb.
		NewID().
		Name("Test Workspace").
		Alias("test-workspace").
		MustBuild()

	assert.NotNil(t, workspace)
	assert.Equal(t, "Test Workspace", workspace.Name())
	assert.Equal(t, "test-workspace", workspace.Alias())
}

func TestBuilder_MustBuild_Panic(t *testing.T) {
	tb := New()
	assert.Panics(t, func() {
		tb.NewID().Name("test").Alias("invalid@alias").MustBuild()
	})
}

func TestBuilder_Chaining(t *testing.T) {
	// Test method chaining
	tb := New()
	result := tb.NewID().Name("test").Alias("test-workspace")
	assert.Equal(t, tb, result)
}
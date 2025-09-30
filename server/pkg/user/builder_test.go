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

func TestBuilder_Build_ErrorInvalidAlias(t *testing.T) {
	tb := New()
	// Invalid alias: too short
	_, err := tb.NewID().Name("test").Email("test@example.com").Alias("ab").Build()
	assert.Equal(t, ErrInvalidAlias, err)

	// Invalid alias: contains invalid characters
	_, err = tb.NewID().Name("test").Email("test@example.com").Alias("user@name").Build()
	assert.Equal(t, ErrInvalidAlias, err)

	// Invalid alias: too long
	_, err = tb.NewID().Name("test").Email("test@example.com").Alias("thisaliasistoolongandexceeds32characters").Build()
	assert.Equal(t, ErrInvalidAlias, err)
}

func TestBuilder_Build_ValidAlias(t *testing.T) {
	tb := New()
	// Valid alias
	user, err := tb.NewID().Name("test").Email("test@example.com").Alias("valid_alias-123").Build()
	assert.NoError(t, err)
	assert.Equal(t, "valid_alias-123", user.Alias())

	// Empty alias should be valid (optional field)
	user, err = tb.NewID().Name("test2").Email("test2@example.com").Alias("").Build()
	assert.NoError(t, err)
	assert.Equal(t, "", user.Alias())
}

func TestBuilder_Build_ErrorInvalidEmailFormat(t *testing.T) {
	tb := New()
	// Invalid email format
	_, err := tb.NewID().Name("test").Email("invalid-email").Build()
	assert.Equal(t, ErrInvalidEmail, err)

	// Empty email
	_, err = tb.NewID().Name("test").Email("").Build()
	assert.Equal(t, ErrInvalidEmail, err)

	// Email with no domain
	_, err = tb.NewID().Name("test").Email("user@").Build()
	assert.Equal(t, ErrInvalidEmail, err)
}

func TestBuilder_Build_ValidEmail(t *testing.T) {
	tb := New()
	// Valid emails
	validEmails := []string{
		"test@example.com",
		"user.name@domain.co.uk",
		"user+tag@domain.org",
		"user_name@sub.domain.com",
	}

	for _, email := range validEmails {
		user, err := tb.NewID().Name("test").Email(email).Build()
		assert.NoError(t, err, "Email should be valid: %s", email)
		assert.Equal(t, email, user.Email())
	}
}

func TestBuilder_Build_ErrorInvalidWorkspace(t *testing.T) {
	tb := New()
	wsId := NewWorkspaceID()
	
	// Create a workspace with different ID
	ws1 := workspace.New().NewID().Name("workspace1").MustBuild()
	workspaceList := workspace.WorkspaceList{*ws1}

	// MyWorkspaceID doesn't match any workspace in the list
	_, err := tb.NewID().Name("test").Email("test@example.com").
		MyWorkspaceID(wsId).Workspaces(workspaceList).Build()
	assert.Equal(t, ErrInvalidWorkspace, err)
}

func TestBuilder_Build_ValidWorkspace(t *testing.T) {
	wsId := NewWorkspaceID()
	
	// Create a workspace with matching ID
	ws1 := workspace.New().ID(wsId).Name("workspace1").MustBuild()
	workspaceList := workspace.WorkspaceList{*ws1}

	// MyWorkspaceID matches workspace in the list
	tb1 := New()
	user, err := tb1.NewID().Name("test").Email("test@example.com").
		MyWorkspaceID(wsId).Workspaces(workspaceList).Build()
	assert.NoError(t, err)
	assert.Equal(t, wsId, user.MyWorkspaceID())

	// No workspace ID is also valid
	tb2 := New()
	user, err = tb2.NewID().Name("test2").Email("test2@example.com").Build()
	assert.NoError(t, err)
	assert.True(t, user.MyWorkspaceID().IsEmpty())

	// Workspace ID with empty workspace list is valid
	tb3 := New()
	user, err = tb3.NewID().Name("test3").Email("test3@example.com").
		MyWorkspaceID(wsId).Build()
	assert.NoError(t, err)
	assert.Equal(t, wsId, user.MyWorkspaceID())
}

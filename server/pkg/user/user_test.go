package user

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/workspace"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestUser_Getters(t *testing.T) {
	id := NewID()
	metadata := Metadata{
		description: "Test user",
		photoURL:    "https://example.com/photo.jpg",
		theme:       "dark",
		website:     "https://example.com",
		lang:        language.English,
	}
	host := "example.com"
	myWorkspaceID := NewWorkspaceID()
	auths := []string{"auth1", "auth2"}
	workspaceList := workspace.WorkspaceList{}
	myWorkspace := workspace.Workspace{}

	user := &User{
		id:            id,
		name:          "John Doe",
		alias:         "johndoe",
		email:         "john@example.com",
		metadata:      metadata,
		host:          &host,
		myWorkspaceID: myWorkspaceID,
		auths:         auths,
		workspaces:    workspaceList,
		myWorkspace:   myWorkspace,
	}

	assert.Equal(t, id, user.ID())
	assert.Equal(t, "John Doe", user.Name())
	assert.Equal(t, "johndoe", user.Alias())
	assert.Equal(t, "john@example.com", user.Email())
	assert.Equal(t, metadata, user.Metadata())
	assert.Equal(t, &host, user.Host())
	assert.Equal(t, myWorkspaceID, user.MyWorkspaceID())
	assert.Equal(t, auths, user.Auths())
	assert.Equal(t, workspaceList, user.Workspaces())
	assert.Equal(t, myWorkspace, user.MyWorkspace())
}

func TestUser_Auths_NilSlice(t *testing.T) {
	user := &User{
		id:    NewID(),
		name:  "John Doe",
		email: "john@example.com",
		auths: nil,
	}

	auths := user.Auths()
	assert.NotNil(t, auths)
	assert.Empty(t, auths)
}

func TestUser_Auths_CopiesSlice(t *testing.T) {
	originalAuths := []string{"auth1", "auth2"}
	user := &User{
		id:    NewID(),
		name:  "John Doe",
		email: "john@example.com",
		auths: originalAuths,
	}

	returnedAuths := user.Auths()

	// Modify the returned slice to ensure it doesn't affect the original
	returnedAuths[0] = "modified-auth"

	// Original should be unchanged
	assert.Equal(t, originalAuths, user.auths)
	assert.NotEqual(t, returnedAuths, user.auths)
}

func TestUser_Clone(t *testing.T) {
	id := NewID()
	metadata := Metadata{
		description: "Test user",
		photoURL:    "https://example.com/photo.jpg",
		theme:       "dark",
		website:     "https://example.com",
		lang:        language.English,
	}
	host := "example.com"
	myWorkspaceID := NewWorkspaceID()
	auths := []string{"auth1", "auth2"}
	workspaceList := workspace.WorkspaceList{}
	myWorkspace := workspace.Workspace{}

	testCases := []struct {
		name     string
		input    *User
		want     *User
		wantNil  bool
		validate func(t *testing.T, original, cloned *User)
	}{
		{
			name:    "nil user",
			input:   nil,
			want:    nil,
			wantNil: true,
		},
		{
			name: "full user with all fields",
			input: &User{
				id:            id,
				name:          "John Doe",
				alias:         "johndoe",
				email:         "john@example.com",
				metadata:      metadata,
				host:          &host,
				myWorkspaceID: myWorkspaceID,
				auths:         auths,
				workspaces:    workspaceList,
				myWorkspace:   myWorkspace,
			},
			validate: func(t *testing.T, original, cloned *User) {
				// Values should be equal
				assert.Equal(t, original.ID(), cloned.ID())
				assert.Equal(t, original.Name(), cloned.Name())
				assert.Equal(t, original.Alias(), cloned.Alias())
				assert.Equal(t, original.Email(), cloned.Email())
				assert.Equal(t, original.Metadata(), cloned.Metadata())
				assert.Equal(t, original.Host(), cloned.Host())
				assert.Equal(t, original.MyWorkspaceID(), cloned.MyWorkspaceID())
				assert.Equal(t, original.Auths(), cloned.Auths())
				assert.Equal(t, original.Workspaces(), cloned.Workspaces())
				assert.Equal(t, original.MyWorkspace(), cloned.MyWorkspace())

				// Should be different instances
				assert.NotSame(t, original, cloned)

				// Auths should be copied, not shared
				if len(original.auths) > 0 && len(cloned.auths) > 0 {
					assert.NotSame(t, &original.auths[0], &cloned.auths[0])
				}
			},
		},
		{
			name: "user with empty auths",
			input: &User{
				id:    NewID(),
				name:  "Jane Doe",
				email: "jane@example.com",
				auths: []string{},
			},
			validate: func(t *testing.T, original, cloned *User) {
				assert.Equal(t, original.Auths(), cloned.Auths())
				assert.Empty(t, cloned.Auths())
				// Verify slices are different instances (even if empty)
				originalSlice := &original.auths
				clonedSlice := &cloned.auths
				assert.NotSame(t, originalSlice, clonedSlice)
			},
		},
		{
			name: "user with nil auths",
			input: &User{
				id:    NewID(),
				name:  "Bob Smith",
				email: "bob@example.com",
				auths: nil,
			},
			validate: func(t *testing.T, original, cloned *User) {
				// Both should return empty slice from Auths() method
				assert.Equal(t, original.Auths(), cloned.Auths())
				assert.Empty(t, cloned.Auths())
				// Clone preserves nil for auths field
				assert.Nil(t, cloned.auths)
			},
		},
		{
			name: "user with zero-value metadata",
			input: &User{
				id:       NewID(),
				name:     "Alice Johnson",
				email:    "alice@example.com",
				metadata: Metadata{},
			},
			validate: func(t *testing.T, original, cloned *User) {
				assert.Equal(t, original.Metadata(), cloned.Metadata())
				assert.Equal(t, Metadata{}, cloned.Metadata())
			},
		},
		{
			name: "minimal user",
			input: &User{
				id:    NewID(),
				name:  "Min User",
				email: "min@example.com",
			},
			validate: func(t *testing.T, original, cloned *User) {
				assert.Equal(t, original.ID(), cloned.ID())
				assert.Equal(t, original.Name(), cloned.Name())
				assert.Equal(t, original.Email(), cloned.Email())
				assert.Equal(t, Metadata{}, cloned.Metadata())
				assert.Empty(t, cloned.Auths())
				assert.Nil(t, cloned.Host())
				assert.Equal(t, "", cloned.MyWorkspaceID().String())
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			cloned := tc.input.Clone()

			if tc.wantNil {
				assert.Nil(t, cloned)
				return
			}

			assert.NotNil(t, cloned)
			if tc.validate != nil {
				tc.validate(t, tc.input, cloned)
			}
		})
	}
}

func TestUser_Clone_Independence(t *testing.T) {
	// Test that modifications to cloned user don't affect original
	original := &User{
		id:    NewID(),
		name:  "John Doe",
		email: "john@example.com",
		auths: []string{"auth1"},
	}

	cloned := original.Clone()

	// Modify cloned auths
	cloned.auths = append(cloned.auths, "auth2")

	// Original should be unchanged
	assert.Len(t, original.auths, 1)
	assert.Len(t, cloned.auths, 2)

	// Modify cloned fields
	cloned.name = "Jane Doe"
	cloned.email = "jane@example.com"

	// Original should be unchanged
	assert.Equal(t, "John Doe", original.name)
	assert.Equal(t, "john@example.com", original.email)
}

func TestErrors(t *testing.T) {
	assert.Equal(t, "invalid name", ErrInvalidName.Error())
	assert.Equal(t, "invalid email", ErrInvalidEmail.Error())
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name     string
		email    string
		expected bool
	}{
		{
			name:     "valid email",
			email:    "test@example.com",
			expected: true,
		},
		{
			name:     "valid email with subdomain",
			email:    "user@mail.example.com",
			expected: true,
		},
		{
			name:     "valid email with plus sign",
			email:    "user+tag@example.com",
			expected: true,
		},
		{
			name:     "valid email with dot",
			email:    "first.last@example.com",
			expected: true,
		},
		{
			name:     "valid email with underscore",
			email:    "user_name@example.com",
			expected: true,
		},
		{
			name:     "empty email",
			email:    "",
			expected: false,
		},
		{
			name:     "invalid email no at sign",
			email:    "testexample.com",
			expected: false,
		},
		{
			name:     "invalid email no domain",
			email:    "test@",
			expected: false,
		},
		{
			name:     "invalid email multiple at signs",
			email:    "test@test@example.com",
			expected: false,
		},
		{
			name:     "invalid email spaces",
			email:    "test user@example.com",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ValidateEmail(tt.email)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestValidateAlias(t *testing.T) {
	tests := []struct {
		name     string
		alias    string
		expected bool
	}{
		{
			name:     "valid alias alphanumeric",
			alias:    "user123",
			expected: true,
		},
		{
			name:     "valid alias with underscore",
			alias:    "user_name",
			expected: true,
		},
		{
			name:     "valid alias with hyphen",
			alias:    "user-name",
			expected: true,
		},
		{
			name:     "valid alias mixed",
			alias:    "user_name-123",
			expected: true,
		},
		{
			name:     "valid alias minimum length",
			alias:    "abc",
			expected: true,
		},
		{
			name:     "valid alias maximum length",
			alias:    "abcdefghijklmnopqrstuvwxyz123456",
			expected: true,
		},
		{
			name:     "empty alias (optional)",
			alias:    "",
			expected: true,
		},
		{
			name:     "invalid alias too short",
			alias:    "ab",
			expected: false,
		},
		{
			name:     "invalid alias too long",
			alias:    "abcdefghijklmnopqrstuvwxyz1234567",
			expected: false,
		},
		{
			name:     "invalid alias with space",
			alias:    "user name",
			expected: false,
		},
		{
			name:     "invalid alias with special characters",
			alias:    "user@name",
			expected: false,
		},
		{
			name:     "invalid alias with dot",
			alias:    "user.name",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ValidateAlias(tt.alias)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestValidateWorkspace(t *testing.T) {
	wsId1 := NewWorkspaceID()
	wsId2 := NewWorkspaceID()

	ws1 := workspace.New().ID(wsId1).Name("workspace1").MustBuild()
	ws2 := workspace.New().ID(wsId2).Name("workspace2").MustBuild()
	workspaceList := workspace.WorkspaceList{*ws1, *ws2}

	tests := []struct {
		name          string
		myWorkspaceID WorkspaceID
		workspaces    workspace.WorkspaceList
		expected      bool
	}{
		{
			name:          "empty workspace ID is invalid",
			myWorkspaceID: WorkspaceID{},
			workspaces:    workspaceList,
			expected:      false,
		},
		{
			name:          "workspace ID with empty list is valid",
			myWorkspaceID: wsId1,
			workspaces:    workspace.WorkspaceList{},
			expected:      true,
		},
		{
			name:          "matching workspace ID",
			myWorkspaceID: wsId1,
			workspaces:    workspaceList,
			expected:      true,
		},
		{
			name:          "second matching workspace ID",
			myWorkspaceID: wsId2,
			workspaces:    workspaceList,
			expected:      true,
		},
		{
			name:          "non-matching workspace ID",
			myWorkspaceID: NewWorkspaceID(),
			workspaces:    workspaceList,
			expected:      false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := ValidateWorkspace(tt.myWorkspaceID, tt.workspaces)
			assert.Equal(t, tt.expected, result)
		})
	}
}

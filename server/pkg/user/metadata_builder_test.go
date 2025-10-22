package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestNewMetadata(t *testing.T) {
	mb := NewMetadata()
	assert.NotNil(t, mb)
	assert.NotNil(t, mb.a)
}

func TestMetadataBuilder_Description(t *testing.T) {
	mb := NewMetadata()
	result := mb.Description("Test description").MustBuild()
	assert.Equal(t, "Test description", result.Description())
}

func TestMetadataBuilder_Lang(t *testing.T) {
	mb := NewMetadata()
	result := mb.Lang(language.English).MustBuild()
	assert.Equal(t, language.English, result.Lang())
}

func TestMetadataBuilder_PhotoURL(t *testing.T) {
	mb := NewMetadata()
	photoURL := "https://example.com/photo.jpg"
	result := mb.PhotoURL(photoURL).MustBuild()
	assert.Equal(t, photoURL, result.PhotoURL())
}

func TestMetadataBuilder_Theme(t *testing.T) {
	mb := NewMetadata()
	result := mb.Theme("dark").MustBuild()
	assert.Equal(t, "dark", result.Theme())
}

func TestMetadataBuilder_Website(t *testing.T) {
	mb := NewMetadata()
	website := "https://example.com"
	result := mb.Website(website).MustBuild()
	assert.Equal(t, website, result.Website())
}

func TestMetadataBuilder_Build_Success(t *testing.T) {
	mb := NewMetadata()
	metadata, err := mb.
		Description("Test user profile").
		Lang(language.English).
		PhotoURL("https://example.com/avatar.jpg").
		Theme("dark").
		Website("https://johndoe.com").
		Build()

	assert.NoError(t, err)
	assert.Equal(t, "Test user profile", metadata.Description())
	assert.Equal(t, language.English, metadata.Lang())
	assert.Equal(t, "https://example.com/avatar.jpg", metadata.PhotoURL())
	assert.Equal(t, "dark", metadata.Theme())
	assert.Equal(t, "https://johndoe.com", metadata.Website())
}

func TestMetadataBuilder_MustBuild_Success(t *testing.T) {
	mb := NewMetadata()
	metadata := mb.
		Description("Test user profile").
		Lang(language.Japanese).
		PhotoURL("https://example.com/avatar.jpg").
		Theme("light").
		Website("https://johndoe.com").
		MustBuild()

	assert.Equal(t, "Test user profile", metadata.Description())
	assert.Equal(t, language.Japanese, metadata.Lang())
	assert.Equal(t, "https://example.com/avatar.jpg", metadata.PhotoURL())
	assert.Equal(t, "light", metadata.Theme())
	assert.Equal(t, "https://johndoe.com", metadata.Website())
}

func TestMetadataBuilder_Chaining(t *testing.T) {
	// Test that all methods return the builder for chaining
	mb := NewMetadata()
	result := mb.Description("test").Lang(language.English).PhotoURL("url").Theme("dark").Website("site")
	assert.Equal(t, mb, result)
}

func TestMetadataBuilder_EmptyValues(t *testing.T) {
	mb := NewMetadata()
	metadata := mb.MustBuild()

	// All values should be zero values
	assert.Equal(t, "", metadata.Description())
	assert.Equal(t, language.Und, metadata.Lang()) // language.Und is the zero value for language.Tag
	assert.Equal(t, "", metadata.PhotoURL())
	assert.Equal(t, "", metadata.Theme())
	assert.Equal(t, "", metadata.Website())
}

func TestMetadataBuilder_OverwriteValues(t *testing.T) {
	mb := NewMetadata()
	metadata := mb.
		Description("First description").
		Description("Second description"). // Overwrite
		Lang(language.English).
		Lang(language.Japanese). // Overwrite
		PhotoURL("first.jpg").
		PhotoURL("second.jpg"). // Overwrite
		Theme("light").
		Theme("dark"). // Overwrite
		Website("first.com").
		Website("second.com"). // Overwrite
		MustBuild()

	// Should have the last set values
	assert.Equal(t, "Second description", metadata.Description())
	assert.Equal(t, language.Japanese, metadata.Lang())
	assert.Equal(t, "second.jpg", metadata.PhotoURL())
	assert.Equal(t, "dark", metadata.Theme())
	assert.Equal(t, "second.com", metadata.Website())
}

func TestMetadataBuilder_Build_AlwaysSucceeds(t *testing.T) {
	// Since metadata builder has no validation, Build should never return an error
	mb := NewMetadata()
	_, err := mb.Build()
	assert.NoError(t, err)
}

func TestMetadataBuilder_LanguageTags(t *testing.T) {
	testCases := []struct {
		name string
		lang language.Tag
	}{
		{"English", language.English},
		{"Japanese", language.Japanese},
		{"Spanish", language.Spanish},
		{"French", language.French},
		{"German", language.German},
		{"Undefined", language.Und},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mb := NewMetadata()
			metadata := mb.Lang(tc.lang).MustBuild()
			assert.Equal(t, tc.lang, metadata.Lang())
		})
	}
}
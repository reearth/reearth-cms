package schema

import (
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewURL(t *testing.T) {
	assert.Equal(t, &FieldURL{}, NewURL())
}

func TestFieldURL_Type(t *testing.T) {
	assert.Equal(t, value.TypeURL, (&FieldURL{}).Type())
}

func TestFieldURL_TypeProperty(t *testing.T) {
	f := FieldURL{}
	assert.Equal(t, &TypeProperty{
		t:   f.Type(),
		url: &f,
	}, (&f).TypeProperty())
}

func TestFieldURL_Clone(t *testing.T) {
	assert.Nil(t, (*FieldURL)(nil).Clone())
	assert.Equal(t, &FieldURL{}, (&FieldURL{}).Clone())
}

func TestFieldURL_Validate(t *testing.T) {
	assert.NoError(t, (&FieldURL{}).Validate(value.TypeURL.Value("https://example.com")))
	assert.Equal(t, ErrInvalidValue, (&FieldURL{}).Validate(value.TypeText.Value("")))

	base := "https://example.com/"
	atLimit := base + strings.Repeat("a", maxURLFieldLength-len(base))
	assert.NoError(t, (&FieldURL{}).Validate(value.TypeURL.Value(atLimit)))
	assert.Equal(t, ErrURLFieldMaxLengthExceeded, (&FieldURL{}).Validate(value.TypeURL.Value(atLimit+"a")))
}

func TestFieldURL_ValidateMultiple(t *testing.T) {
	f := &FieldURL{}
	assert.NoError(t, f.ValidateMultiple(value.NewMultiple(value.TypeURL, []any{"https://example.com/a", "https://example.com/b"})))
}

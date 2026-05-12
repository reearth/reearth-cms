package job

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestTypeFrom(t *testing.T) {
	tests := []struct {
		name   string
		input  string
		want   Type
		wantOk bool
	}{
		{
			name:   "import",
			input:  "import",
			want:   TypeImport,
			wantOk: true,
		},
		{
			name:   "uppercase IMPORT",
			input:  "IMPORT",
			want:   TypeImport,
			wantOk: true,
		},
		{
			name:   "mixed case Import",
			input:  "Import",
			want:   TypeImport,
			wantOk: true,
		},
		{
			name:   "invalid type",
			input:  "unknown",
			want:   Type(""),
			wantOk: false,
		},
		{
			name:   "empty string",
			input:  "",
			want:   Type(""),
			wantOk: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, ok := TypeFrom(tt.input)
			assert.Equal(t, tt.wantOk, ok)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestTypeFromRef(t *testing.T) {
	tests := []struct {
		name  string
		input *string
		want  *Type
	}{
		{
			name:  "nil input",
			input: nil,
			want:  nil,
		},
		{
			name:  "valid type",
			input: lo.ToPtr("import"),
			want:  lo.ToPtr(TypeImport),
		},
		{
			name:  "invalid type",
			input: lo.ToPtr("unknown"),
			want:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := TypeFromRef(tt.input)
			if tt.want == nil {
				assert.Nil(t, got)
			} else {
				assert.NotNil(t, got)
				assert.Equal(t, *tt.want, *got)
			}
		})
	}
}

func TestType_String(t *testing.T) {
	tests := []struct {
		name    string
		jobType Type
		want    string
	}{
		{
			name:    "import",
			jobType: TypeImport,
			want:    "import",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, tt.jobType.String())
		})
	}
}

func TestType_StringRef(t *testing.T) {
	t.Run("nil type", func(t *testing.T) {
		t.Parallel()

		var jt *Type
		assert.Nil(t, jt.StringRef())
	})

	t.Run("non-nil type", func(t *testing.T) {
		t.Parallel()

		jt := TypeImport
		got := jt.StringRef()
		assert.NotNil(t, got)
		assert.Equal(t, "import", *got)
	})
}

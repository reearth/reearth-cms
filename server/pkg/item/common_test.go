package item

import "testing"

func TestNormalizeText(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "ASCII unchanged",
			input:    "file.txt",
			expected: "file.txt",
		},
		{
			name:     "Unicode normalization",
			input:    "ポール.txt", // decomposed form
			expected: "ポール.txt", // composed form
		},
		{
			name:     "Fullwidth to halfwidth",
			input:    "ｆｉｌｅ．ｔｘｔ",
			expected: "file.txt",
		},
		{
			name:     "Japanese with fullwidth spaces",
			input:    "ファイル　名.txt",
			expected: "ファイル 名.txt",
		},
		{
			name:     "Mixed unicode with fullwidth digits",
			input:    "café-２０２４.pdf",
			expected: "café-2024.pdf",
		},
		{
			name:     "Empty string",
			input:    "",
			expected: "",
		},
		{
			name:     "Only spaces",
			input:    "   ",
			expected: "   ",
		},
		{
			name:     "Complex unicode composition",
			input:    "résumé.docx",
			expected: "résumé.docx",
		},
		{
			name:     "Fullwidth parentheses and brackets",
			input:    "file（１）［test］.zip",
			expected: "file(1)[test].zip",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := NormalizeText(tt.input)
			if result != tt.expected {
				t.Errorf("NormalizeText(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

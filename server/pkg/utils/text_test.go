package utils

import "testing"

func TestNormalizeText(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "fullwidth alphanumeric to halfwidth",
			input:    "Ｔｏｋｙｏ２０２４",
			expected: "Tokyo2024",
		},
		{
			name:     "fullwidth symbols",
			input:    "ｆｉｌｅ．ｔｘｔ",
			expected: "file.txt",
		},
		{
			name:     "mixed fullwidth and halfwidth",
			input:    "Tokyo２０２４",
			expected: "Tokyo2024",
		},
		{
			name:     "already normalized text",
			input:    "Tokyo2024",
			expected: "Tokyo2024",
		},
		{
			name:     "empty string",
			input:    "",
			expected: "",
		},
		{
			name:     "unicode with combining characters",
			input:    "café",
			expected: "café",
		},
		{
			name:     "fullwidth katakana space",
			input:    "テスト　ファイル",
			expected: "テスト ファイル",
		},
		{
			name:     "compatibility ideographic space",
			input:    "test　file",
			expected: "test file",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := NormalizeText(tt.input)
			if result != tt.expected {
				t.Errorf("NormalizeText(%q) = %q; want %q", tt.input, result, tt.expected)
			}
		})
	}
}

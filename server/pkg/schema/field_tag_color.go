package schema

import "strings"

type TagColor string

var TagColorMagenta TagColor = "magenta"
var TagColorRed TagColor = "red"
var TagColorVolcano TagColor = "volcano"
var TagColorOrange TagColor = "orange"
var TagColorGold TagColor = "gold"
var TagColorLime TagColor = "lime"
var TagColorGreen TagColor = "green"
var TagColorCyan TagColor = "cyan"
var TagColorBlue TagColor = "blue"
var TagColorGeekblue TagColor = "geekblue"
var TagColorPurple TagColor = "purple"

func (s TagColor) String() string {
	return string(s)
}

func TagColorFrom(s string) TagColor {
	ss := strings.ToLower(s)
	switch TagColor(ss) {
	case TagColorMagenta:
		return TagColorMagenta
	case TagColorRed:
		return TagColorRed
	case TagColorVolcano:
		return TagColorVolcano
	case TagColorOrange:
		return TagColorOrange
	case TagColorGreen:
		return TagColorGreen
	case TagColorGold:
		return TagColorGold
	case TagColorLime:
		return TagColorLime
	case TagColorCyan:
		return TagColorCyan
	case TagColorBlue:
		return TagColorBlue
	case TagColorGeekblue:
		return TagColorGeekblue
	case TagColorPurple:
		return TagColorPurple

	default:
		return TagColor("")
	}
}

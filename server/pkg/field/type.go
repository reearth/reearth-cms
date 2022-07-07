package model

type Type string

const (
	Text         Type = "text"
	TextArea     Type = "textArea"
	RichText     Type = "richText"
	MarkdownText Type = "markdownText"
	Asset        Type = "asset"
	Date         Type = "date"
	Bool         Type = "bool"
	Select       Type = "select"
	Tag          Type = "tag"
	Integer      Type = "integer"
	Reference    Type = "reference"
	URL          Type = "URL"
)

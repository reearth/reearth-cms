package types

type JSONSchema struct {
	Id          *string `json:"$id,omitempty"`
	Schema      *string `json:"$schema,omitempty"`
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`
	Type        string  `json:"type"`
	Format      *string `json:"format,omitempty"`

	// for object types (in cms, for a group, or an asset field)
	Properties map[string]JSONSchema `json:"properties,omitempty"`

	// for array types (in cms, when the field is multiple)
	Items *JSONSchema `json:"items,omitempty"`

	// for string types
	MaxLength *int `json:"maxLength,omitempty"`

	// for number types
	Maximum *float64 `json:"maximum,omitempty"`
	Minimum *float64 `json:"minimum,omitempty"`
}

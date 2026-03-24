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

	// for all types
	DefaultValue any `json:"x-defaultValue,omitempty"`

	// for all types
	FieldType string `json:"x-fieldType,omitempty"`
	Unique    bool   `json:"x-unique,omitempty"`
	Required  bool   `json:"x-required,omitempty"`
	Multiple  bool   `json:"x-multiple,omitempty"`

	// for string based types
	MaxLength *int `json:"maxLength,omitempty"`

	// for number types
	Maximum *float64 `json:"maximum,omitempty"`
	Minimum *float64 `json:"minimum,omitempty"`

	// for geo type
	GeoSupportedType *string `json:"x-geoSupportedType,omitempty"`

	// for geo type
	GeoSupportedTypes *[]string `json:"x-geoSupportedTypes,omitempty"`

	// for select type
	Options *[]string `json:"x-options,omitempty"`
}

package schema

type FieldType string

const (
	TextField     FieldType = "TEXT"
	TextAreaField FieldType = "TEXT_AREA"
	BooleanField  FieldType = "BOOLEAN"
	// TODO: add more field here
)

type Field interface {
	Type() FieldType
	IsUnique() bool
	AllowMultiple() bool
	IsNotNull() bool
}

type SchemaField struct {
	fType         FieldType
	constraint    bool //TODO: change later
	isUnique      bool
	allowMultiple bool
	isNotNull     bool
	id            interface{} //TODO: change later
	apiID         string
}

func NewSchemaField() Field {
	return &SchemaField{}
}

func (f *SchemaField) Type() FieldType {
	return FieldType("Hogel")
}

func (f *SchemaField) IsUnique() bool {
	return false
}

func (f *SchemaField) AllowMultiple() bool {
	return false
}

func (f *SchemaField) IsNotNull() bool {
	return false
}

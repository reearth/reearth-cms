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
	DispayName() string
	IsUnique() bool
	AllowMultiple() bool
	IsNotNull() bool
}

// MEMO: Generics?
type SchemaField struct {
	id            interface{} //TODO: change later
	displayName   string
	apiID         ApiID
	fType         FieldType
	constraint    bool //TODO: change later
	isUnique      bool
	allowMultiple bool
	isNotNull     bool
}

func NewSchemaField() Field {
	// TODO: recieve params and set them to the field of SchemaField's field
	return &SchemaField{}
}

func (f *SchemaField) Type() FieldType {
	return f.fType
}

func (f *SchemaField) IsUnique() bool {
	return f.isUnique
}

func (f *SchemaField) AllowMultiple() bool {
	return f.allowMultiple
}

func (f *SchemaField) IsNotNull() bool {
	return f.isNotNull
}

func (f *SchemaField) ApiID() ApiID {
	return f.apiID
}

func (f *SchemaField) SetApiID(aID string) error {
	aID2, err := NewAPIID(aID)
	if err != nil {
		return err
	}
	f.apiID = aID2
	return nil
}

//TODO: impl getter and setter which encapsule domain model. 以下ドメインモデルを守る実装も同様に行う

package item

type GroupField struct {
	id      GroupFieldID
	group   GroupID
	schema  SchemaID
	model   ModelID
	project ProjectID
	fields  []*Field
}

func (g GroupField) ID() GroupFieldID {
	return g.id
}

func (g GroupField) Group() GroupID {
	return g.group
}

func (g GroupField) Model() ModelID {
	return g.model
}

func (g GroupField) Schema() SchemaID {
	return g.schema
}

func (g GroupField) Project() ProjectID {
	return g.project
}

func (g GroupField) Fields() []*Field {
	return g.fields
}

package item

type Meta struct {
	id      ID
	schema  SchemaID
	model   ModelID
	project ProjectID
	fields  []*Field
	status  Status
}

func (m *Meta) ID() ID {
	return m.id
}

func (m *Meta) SetID(id ID) {
	m.id = id
}

func (m *Meta) Schema() SchemaID {
	return m.schema
}

func (m *Meta) SetSchema(schema SchemaID) {
	m.schema = schema
}

func (m *Meta) Model() ModelID {
	return m.model
}

func (m *Meta) SetModel(model ModelID) {
	m.model = model
}

func (m *Meta) Project() ProjectID {
	return m.project
}

func (m *Meta) SetProject(project ProjectID) {
	m.project = project
}

func (m *Meta) Fields() []*Field {
	return m.fields
}

func (m *Meta) SetFields(fields []*Field) {
	m.fields = fields
}

func (m *Meta) Status() Status {
	return m.status
}

func (m *Meta) SetStatus(status Status) {
	m.status = status
}

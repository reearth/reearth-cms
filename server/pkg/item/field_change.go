package item


type FieldChangeType string

const (
	Add    FieldChangeType = "add"
	Update FieldChangeType = "update"
	Delete FieldChangeType = "delete"
)


type FieldChange struct {
	Id *FieldID
	CurrentValue any
	PreviousValue any
	Type FieldChangeType
}


func NewItemChange(n []*Field, o []*Field) []FieldChange {
	nFields := make(map[string]*Field)
	oFields := make(map[string]*Field)

	for _, field := range n {
		if field != nil {
			nFields[field.FieldID().String()] = field
		}
	}
	for _, field := range o {
		if field != nil {
			oFields[field.FieldID().String()] = field
		}
	}

	var changes []FieldChange

	for fieldID, newField := range nFields {
		oldField, exists := oFields[fieldID]

		if exists && newField.Value().Equal(oldField.Value()) {
			continue
		}
		fieldIDPtr := newField.FieldID();
		change := FieldChange{
			Id:             &fieldIDPtr,
			Type:           Update,
			PreviousValue: newField.value.Interface(),
			CurrentValue:   oldField.value.Interface(),
		}

		changes = append(changes, change)
	}

	for fieldID := range oFields {
		_, exists := nFields[fieldID]
		if !exists {
			fieldIDPtr := oFields[fieldID].FieldID();
			change := FieldChange{
				Id:           &fieldIDPtr,
				Type:         Add,
				CurrentValue: oFields[fieldID].value.Interface(),
			}

			changes = append(changes, change)
		}
	}

	for fieldID := range nFields {
		_, exists := oFields[fieldID]
		if !exists {
			fieldIDPtr := nFields[fieldID].FieldID()
			change := FieldChange{
				Id:             &fieldIDPtr,
				Type:           Delete,
				PreviousValue:  nil,
				CurrentValue:   nFields[fieldID].value.Interface(),
			}

			changes = append(changes, change)
		}
	}

	return changes
}

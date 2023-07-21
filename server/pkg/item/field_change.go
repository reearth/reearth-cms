package item


type FieldChangeType string

const (
	Add    FieldChangeType = "add"
	Update FieldChangeType = "update"
	Delete FieldChangeType = "delete"
)


type FieldChange struct {
	ID *FieldID
	CurrentValue []interface{}
	PreviousValue []interface{}
	Type FieldChangeType
}


func CompareFields(n []*Field, o []*Field) []FieldChange {
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
		if exists {
			fieldIDPtr := newField.FieldID();
			change := FieldChange{
				ID:             &fieldIDPtr,
				Type:           Update,
				PreviousValue: oldField.value.Interface(),
				CurrentValue:   newField.value.Interface(),
			}

			changes = append(changes, change)
		}
	}

	for fieldID := range oFields {
		_, exists := nFields[fieldID]
		if !exists {
			fieldIDPtr := oFields[fieldID].FieldID();
			change := FieldChange{
				ID:           &fieldIDPtr,
				Type:         Delete,
				PreviousValue: oFields[fieldID].value.Interface(),
				CurrentValue:   nil,
			}

			changes = append(changes, change)
		}
	}

	for fieldID := range nFields {
		_, exists := oFields[fieldID]
		if !exists {
			fieldIDPtr := nFields[fieldID].FieldID()
			change := FieldChange{
				ID:             &fieldIDPtr,
				Type:           Add,
				PreviousValue:  nil,
				CurrentValue:   nFields[fieldID].value.Interface(),
			}

			changes = append(changes, change)
		}
	}	

	return changes
}

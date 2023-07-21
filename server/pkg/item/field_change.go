package item

import "github.com/reearth/reearth-cms/server/pkg/value"


type FieldChangeType string

const (
	Add    FieldChangeType = "add"
	Update FieldChangeType = "update"
	Delete FieldChangeType = "delete"
)


type FieldChange struct {
	ID *FieldID `json:"id"`
	CurrentValue *value.Multiple
	PreviousValue *value.Multiple
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
				PreviousValue: oldField.value,
				CurrentValue:   newField.value,
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
				PreviousValue: oFields[fieldID].value,
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
				CurrentValue:   nFields[fieldID].value,
			}

			changes = append(changes, change)
		}
	}	

	return changes
}

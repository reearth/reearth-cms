package task

import (
	"encoding/json"
	"reflect"
	"testing"
)

// The JSON shape is the contract between the server and the worker: old
// workers must keep decoding what new servers send.
func TestChanges_JSON(t *testing.T) {
	changes := Changes{
		"id":            {Type: ChangeTypeULID, Value: float64(1700000000000)},
		"schema":        {Type: ChangeTypeSet, Value: "01hz0000000000000000000000"},
		"updatedbyuser": {Type: ChangeTypeSet, Value: nil},
		"__v":           {Type: ChangeTypeNew, Value: "version"},
	}
	want := `{"__v":{"Type":"new","Value":"version"},"id":{"Type":"ulid","Value":1700000000000},"schema":{"Type":"set","Value":"01hz0000000000000000000000"},"updatedbyuser":{"Type":"set","Value":null}}`

	got, err := json.Marshal(changes)
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != want {
		t.Errorf("marshal:\n got %s\nwant %s", got, want)
	}

	var decoded Changes
	if err := json.Unmarshal([]byte(want), &decoded); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(decoded, changes) {
		t.Errorf("unmarshal:\n got %#v\nwant %#v", decoded, changes)
	}
}

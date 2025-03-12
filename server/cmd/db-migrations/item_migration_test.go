package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func Test_updateItem(t *testing.T) {
	tests := []struct {
		name    string
		args    ItemDocument
		want    ItemDocument
		wantErr error
	}{
		{
			name: "date to datetime",
			args: ItemDocument{
				Fields: []ItemFieldDocument{
					{
						F: "id1",
						V: ValueDocument{
							T: "date",
							V: bson.A{"2021-01-01"},
						},
					},
				},
			},
			want: ItemDocument{
				Fields: []ItemFieldDocument{
					{
						F: "id1",
						V: ValueDocument{
							T: "datetime",
							V: bson.A{"2021-01-01"},
						},
					},
				},
			},
			wantErr: nil,
		},
		{
			name: "value should be stored as array",
			args: ItemDocument{
				Fields: []ItemFieldDocument{
					{
						F: "id1",
						V: ValueDocument{
							T: "number",
							V: 123,
						},
					},
				},
			},
			want: ItemDocument{
				Fields: []ItemFieldDocument{
					{
						F: "id1",
						V: ValueDocument{
							T: "number",
							V: bson.A{123},
						},
					},
				},
			},
			wantErr: nil,
		},
		{
			name: "old structure to new structure",
			args: ItemDocument{
				Fields: []ItemFieldDocument{
					{
						Field:     "id1",
						ValueType: "number",
						Value:     123,
						F:         "",
						V: ValueDocument{
							T: "",
							V: nil,
						},
					},
				},
			},
			want: ItemDocument{
				Fields: []ItemFieldDocument{
					{
						F: "id1",
						V: ValueDocument{
							T: "number",
							V: bson.A{123},
						},
					},
				},
			},
			wantErr: nil,
		},
		{
			name: "assets ids to flat array",
			args: ItemDocument{
				Fields: []ItemFieldDocument{
					{
						F: "id1",
						V: ValueDocument{
							T: "asset",
							V: "aid1",
						},
					},
					{
						F: "id2",
						V: ValueDocument{
							T: "asset",
							V: bson.A{"aid2", "aid3"},
						},
					},
				},
			},
			want: ItemDocument{
				Fields: []ItemFieldDocument{
					{
						F: "id1",
						V: ValueDocument{
							T: "asset",
							V: bson.A{"aid1"},
						},
					},
					{
						F: "id2",
						V: ValueDocument{
							T: "asset",
							V: bson.A{"aid2", "aid3"},
						},
					},
				},
				Assets: []string{"aid1", "aid2", "aid3"},
			},
			wantErr: nil,
		},
		{
			name: "assets ids to flat array with duplicate",
			args: ItemDocument{
				Fields: []ItemFieldDocument{
					{
						F: "id1",
						V: ValueDocument{
							T: "asset",
							V: "aid1",
						},
					},
					{
						F: "id2",
						V: ValueDocument{
							T: "asset",
							V: bson.A{"aid1", "aid2", "aid3"},
						},
					},
				},
			},
			want: ItemDocument{
				Fields: []ItemFieldDocument{
					{
						F: "id1",
						V: ValueDocument{
							T: "asset",
							V: bson.A{"aid1"},
						},
					},
					{
						F: "id2",
						V: ValueDocument{
							T: "asset",
							V: bson.A{"aid1", "aid2", "aid3"},
						},
					},
				},
				Assets: []string{"aid1", "aid2", "aid3"},
			},
			wantErr: nil,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := updateItem(tt.args)
			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}

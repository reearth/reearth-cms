package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewGeometry(t *testing.T) {
	expected := &FieldGeometry{
		st: GeometrySupportedTypeList{"POINT"},
	}
	res := NewGeometry(GeometrySupportedTypeList{"POINT"})
	assert.Equal(t, expected, res)
}

func TestFieldGeometry_Type(t *testing.T) {
	assert.Equal(t, value.TypeGeometry, (&FieldGeometry{}).Type())
}

func TestFieldGeometry_TypeProperty(t *testing.T) {
	f := FieldGeometry{}
	assert.Equal(t, &TypeProperty{
		t:        f.Type(),
		geometry: &f,
	}, (&f).TypeProperty())
}
func TestFieldGeometry_Clone(t *testing.T) {
	assert.Nil(t, (*FieldGeometry)(nil).Clone())
	assert.Equal(t, &FieldGeometry{}, (&FieldGeometry{}).Clone())
}

func TestFieldGeometry_Validate(t *testing.T) {
	supportedType := GeometrySupportedTypePoint
	geojson := `{
				"type": "Point",
				"coordinates": [102.0, 0.5]
			}`
	geojson2 := `{
				"type": "LineString",
				"coordinates": [
          [
            114.70437290715995,
            -0.49283758513797693
          ],
          [
            117.94574361321565,
            1.6624101817629793
          ],
          [
            122.18758253669148,
            3.1330366417804214
          ]
        ]
			}`
	assert.NoError(t, (&FieldGeometry{st: GeometrySupportedTypeList{supportedType}}).Validate(value.TypeGeometry.Value(geojson)))
	assert.Equal(t, (&FieldGeometry{st: GeometrySupportedTypeList{supportedType}}).Validate(value.TypeGeometry.Value(geojson2)), ErrUnsupportedType)
	assert.Equal(t, ErrInvalidValue, (&FieldGeometry{}).Validate(value.TypeText.Value("{}")))
	assert.Equal(t, ErrInvalidValue, (&FieldGeometry{}).Validate(value.TypeText.Value(float64(1))))
}

func TestIsValidGeoJSON(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected bool
	}{

		{
			name: "valid GeoJSON geometry",
			input: `{
				"type": "Point",
				"coordinates": [102.0, 0.5]
			}`,
			expected: true,
		},
		{
			name: "valid GeoJSON geometry",
			input: `{
				"type": "LineString",
				"coordinates": [
          [
            114.70437290715995,
            -0.49283758513797693
          ],
          [
            117.94574361321565,
            1.6624101817629793
          ],
          [
            122.18758253669148,
            3.1330366417804214
          ]
        ]
			}`,

			expected: true,
		},
		{
			name: "invalid GeoJSON geometry",
			input: `{
				"type": "LineString",
				"coordinates": [
					  [
						114.70437290715995,
						-0.49283758513797693
					  ]
        ]
			}`,

			expected: false,
		},
		{
			name: "valid GeoJSON geometry",
			input: `{
				  "type": "Polygon",
				  "coordinates": [
					[
					  [100.0, 0.0, 0.0],
					  [105.0, 0.0, 0.0],
					  [105.0, 5.0, 0.0],
					  [100.0, 0.0, 0.0]
					]
				  ]
				}`,

			expected: true,
		},
		{
			name: "invalid GeoJSON geometry",
			input: `{
				  "type": "Polygon",
				  "coordinates": [
					[
					  [100.0, 0.0, 0.0],
					  [105.0, 0.0, 0.0],
					  [100.0, 0.0, 0.0]
					]
				  ]
				}`,

			expected: false,
		},
		{
			name: "valid GeoJSON geometry",
			input: `{
				  "type": "Polygon",
				  "coordinates": [
					[
					  [100.0, 0.0, 0.0],
					  [105.0, 0.0, 0.0],
					  [105.0, 5.0, 0.0],
					  [100.0, 0.0, 1.0]
					]
				  ]
				}`,

			expected: false,
		},
		{
			name: "valid GeoJSON geometry",
			input: `{
				  "type": "Polygon",
				  "coordinates": [
						[
						  [100.0, 0.0, 0.0],
						  [105.0, 0.0, 0.0],
						  [105.0, 5.0, 0.0],
						  [100.0, 5.0, 0.0],
						  [100.0, 0.0, 0.0]
						],
						[
						  [101.0, 1.0, 0.0],
						  [104.0, 4.0, 0.0],
						  [101.0, 1.0, 0.0]
						]
					  ]
				}`,

			expected: false,
		},
		{
			name: "invalid GeoJSON geometry",
			input: `{
				"type": "MultiLineString",
				"coordinates": [
			[
			  [
				114.70437290715995,
				-0.49283758513797693
			  ],
			  [
				117.94574361321565,
				1.6624101817629793
			  ],
			  [
				122.18758253669148,
				3.1330366417804214
			  ]
        	],
			[
 			
		    [105.0, 1.0, 40.0]
			]
		]
			}`,

			expected: false,
		},
		{
			name: "invalid GeoJSON geometry",
			input: `{
       "type": "MultiPolygon",
       "coordinates": [
           [
               [
                   [180.0, 40.0], [180.0, 50.0], [170.0, 50.0],
                   [170.0, 40.0], [180.0, 41.0]
               ]
           ],
           [
               [
                   [-170.0, 40.0], [-170.0, 50.0], [-180.0, 50.0],
                   [-180.0, 40.0], [-170.0, 40.0]
               ]
           ]
       ]
   }`,

			expected: false,
		},
		{
			name: "invalid GeoJSON type",
			input: `{
				"type": "InvalidType",
				"coordinates": [102.0, 0.5]
			}`,
			expected: false,
		},
		{
			name:     "empty string",
			input:    ``,
			expected: false,
		},
		{
			name:     "random string",
			input:    `random string`,
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, ok := IsValidGeoJSON(tt.input)
			assert.Equal(t, tt.expected, ok)
		})
	}
}

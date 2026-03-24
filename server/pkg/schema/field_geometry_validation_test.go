package schema

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

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
				"type": "MultiPoint",
				"coordinates": [[102.0, 0.5],[4.3,4,2]]
			}`,
			expected: true,
		},
		{
			name: "invalid GeoJSON geometry",
			input: `{
				"type": "Point",
				"coordinates": [102.0]
			}`,
			expected: false,
		},
		{
			name: "invalid GeoJSON geometry",
			input: `{
				"type": "Point",
				"coordinates": [102.0, 0.5, 2.3, 4.2]
			}`,
			expected: false,
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
			name: "invalid GeoJSON type",
			input: `{
			  "type": "GeometryCollection",
			  "geometries": [
				{
				  "type": "Point",
				  "coordinates": [100.0, 0.0]
				},
				{
				  "type": "LineString",
				  "coordinates": [
					[101.0, 0.0],
					[102.0, 1.0]
				  ]
				},
				{
				  "type": "Polygon",
				  "coordinates": [
					[
					  [100.0, 0.0],
					  [101.0, 0.0],
					  [101.0, 1.0],
					  [100.0, 1.0],
					  [100.0, 0.0]
					]
				  ]
				}
			  ]
			}`,
			expected: true,
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
			_, ok := isValidGeoJSON(tt.input)
			assert.Equal(t, tt.expected, ok)
		})
	}
}

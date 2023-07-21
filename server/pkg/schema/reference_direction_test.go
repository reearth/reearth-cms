package schema

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestReferenceDirection_ReferenceDirectionFrom(t *testing.T) {
	tests := []struct {
		Name     string
		Expected struct {
			TA   ReferenceDirection
			Bool bool
		}
	}{
		{
			Name: "one_way",
			Expected: struct {
				TA   ReferenceDirection
				Bool bool
			}{
				TA:   ReferenceDirectionOneWay,
				Bool: true,
			},
		},
		{
			Name: "two_way",
			Expected: struct {
				TA   ReferenceDirection
				Bool bool
			}{
				TA:   ReferenceDirectionTwoWay,
				Bool: true,
			},
		},
		{
			Name: "undefined",
			Expected: struct {
				TA   ReferenceDirection
				Bool bool
			}{
				TA:   ReferenceDirection(""),
				Bool: false,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res, ok := ReferenceDirectionFrom(tc.Name)
			assert.Equal(t, tc.Expected.TA, res)
			assert.Equal(t, tc.Expected.Bool, ok)
		})
	}
}

func TestReferenceDirection_String(t *testing.T) {
	s := "one_way"
	d := ReferenceDirectionOneWay
	assert.Equal(t, s, d.String())
}

func TestReferenceDirection_ToPtr(t *testing.T) {
	s := ReferenceDirectionOneWay
	assert.Equal(t, &s, s.ToPtr())
}

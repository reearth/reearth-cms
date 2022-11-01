package value

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestValue(t *testing.T) {
	tests := []struct {
		Name    string
		Type    Type
		Input   any
		Result  any
		WantErr bool
	}{
		{
			Name:   "asset",
			Type:   TypeAsset,
			Input:  "01ggrrt8aya669r0xaemt2djx7",
			Result: id.MustAssetID("01ggrrt8aya669r0xaemt2djx7"),
		},
		// TODO
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			w, err := NewOptional(tc.Type, nil)
			assert.Equal(t, &Value{t: tc.Type}, w)
			assert.NoError(t, err)

			v, err := New(tc.Type, tc.Input)
			if tc.WantErr {
				assert.Nil(t, v)
				assert.Same(t, ErrInvalidValue, err)
				assert.PanicsWithError(t, ErrInvalidValue.Error(), func() {
					_ = Must(tc.Type, tc.Input)
				})
				return
			}

			assert.NoError(t, err)
			want := &Value{t: tc.Type, v: tc.Result}
			assert.Equal(t, want, v)
			assert.Equal(t, want, Must(tc.Type, tc.Input))
			assert.Equal(t, tc.Type, v.Type())
			assert.Equal(t, tc.Result, v.Value())
		})
	}
}

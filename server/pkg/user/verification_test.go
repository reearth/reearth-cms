package user

import (
	"testing"
	"time"

	"github.com/google/uuid"

	"github.com/stretchr/testify/assert"
)

func TestNewVerification(t *testing.T) {
	type fields struct {
		verified   bool
		code       bool
		expiration bool
	}

	tests := []struct {
		name string
		want fields
	}{
		{
			name: "init verification struct",

			want: fields{
				verified:   false,
				code:       true,
				expiration: true,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewVerification()
			assert.Equal(t, tt.want.verified, got.IsVerified())
			assert.Equal(t, tt.want.code, len(got.Code()) > 0)
			assert.Equal(t, tt.want.expiration, !got.Expiration().IsZero())
		})
	}
}

func TestVerification_Code(t *testing.T) {
	tests := []struct {
		name         string
		verification *Verification
		want         string
	}{
		{
			name: "should return a code string",
			verification: &Verification{
				verified:   false,
				code:       "xxx",
				expiration: time.Time{},
			},
			want: "xxx",
		},
		{
			name: "should return a empty string",
			want: "",
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			assert.Equal(tt, tc.want, tc.verification.Code())
		})
	}
}

func TestVerification_Expiration(t *testing.T) {
	e := time.Now()

	tests := []struct {
		name         string
		verification *Verification
		want         time.Time
	}{
		{
			name: "should return now date",
			verification: &Verification{
				verified:   false,
				code:       "",
				expiration: e,
			},
			want: e,
		},
		{
			name:         "should return zero time",
			verification: nil,
			want:         time.Time{},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.want, tc.verification.Expiration())
		})
	}
}

func TestVerification_IsExpired(t *testing.T) {
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	tim2 := time.Now().Add(time.Hour * 24)

	tests := []struct {
		name         string
		verification *Verification
		want         bool
	}{
		{
			name: "should be expired",
			verification: &Verification{
				verified:   false,
				code:       "xxx",
				expiration: tim,
			},
			want: true,
		},
		{
			name: "shouldn't be expired",
			verification: &Verification{
				verified:   false,
				code:       "xxx",
				expiration: tim2,
			},
			want: false,
		},
		{
			name:         "nil",
			verification: nil,
			want:         true,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.want, tc.verification.IsExpired())
		})
	}
}

func TestVerification_IsVerified(t *testing.T) {
	tests := []struct {
		name         string
		verification *Verification
		want         bool
	}{
		{
			name: "should return true",
			verification: &Verification{
				verified: true,
			},
			want: true,
		},
		{
			name:         "should return false",
			verification: nil,
			want:         false,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.want, tc.verification.IsVerified())
		})
	}
}

func TestVerification_SetVerified(t *testing.T) {
	tests := []struct {
		name         string
		verification *Verification
		input        bool
		want         bool
	}{
		{
			name: "should set true",
			verification: &Verification{
				verified: false,
			},
			input: true,
			want:  true,
		},
		{
			name:         "should return false",
			verification: nil,
			want:         false,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			tc.verification.SetVerified(tc.input)
			assert.Equal(tt, tc.want, tc.verification.IsVerified())
		})
	}
}

func Test_generateCode(t *testing.T) {
	str := generateCode()
	_, err := uuid.Parse(str)
	assert.NoError(t, err)
}

func TestVerificationFrom(t *testing.T) {
	c, e, b := "xyz", time.Now(), true
	assert.Equal(t, &Verification{
		verified:   b,
		code:       c,
		expiration: e,
	}, VerificationFrom(c, e, b))
}

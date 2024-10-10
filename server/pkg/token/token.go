package token

import (
	"crypto/rand"
	"math/big"
)

func Random() string {
	tn, err := randomString(43)
	if err != nil {
		return ""
	}
	return "secret_" + tn
}

func randomString(n int) (string, error) {
	const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	result := make([]byte, n)
	for i := 0; i < n; i++ {
		randIndex, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", err
		}
		result[i] = letters[randIndex.Int64()]
	}

	return string(result), nil
}

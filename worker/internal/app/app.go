package app

import (
	"fmt"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World")
}

func Start(debug bool, version string) {
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}

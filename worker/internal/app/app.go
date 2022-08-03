package app

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	// "github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	rhttp "github.com/reearth/reearth-cms/worker/internal/adapter/http"
	"github.com/reearth/reearth-cms/worker/internal/usecase/interactor"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World")
}

func decompressHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		func() {
			// g := &gateway.Container{}
			uc := interactor.NewUsecase(nil)
			ctx := context.Background()
			c := rhttp.NewDecompressController(uc)
			var input rhttp.DecompressInput
			_, err := json.Marshal(&input)
			if err != nil {
				panic("not implemented")
			}
			c.Decompress(ctx, input) //TODO: error handle
		}()
	}
}

func Start(debug bool, version string) {
	http.HandleFunc("/", handler)
	http.HandleFunc("/decompress", decompressHandler)
	http.ListenAndServe(":8080", nil)
}

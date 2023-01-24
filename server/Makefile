lint:
	golangci-lint run --fix

test:
	go test -race -v ./...

build:
	go build ./cmd/reearth-cms

run-app:
	go run ./cmd/reearth-cms

run-db:
	docker compose up -d reearth-cms-mongo

gql:
	go generate ./internal/adapter/gql

i18n:
	go run github.com/reearth/reearthx/tools i18n-extract --lang en,ja --outdir i18n ..

.PHONY: lint test build run-app run-db gql

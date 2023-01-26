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
	go run github.com/reearth/reearthx/tools i18n-extract --l en,ja --o i18n ..

i18n-ci:
	go run github.com/reearth/reearthx/tools i18n-extract --l en,ja --o i18n --fail-on-update ..

.PHONY: lint test build run-app run-db gql

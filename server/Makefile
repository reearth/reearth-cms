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

.PHONY: lint test build run-app run-db gql

i18n:
	goi18n extract -outdir ./internal/app/i18n -format yaml

i18n-merge:
	goi18n merge -outdir ./internal/app/i18n -format yaml ./internal/app/i18n/active.en.yaml ./internal/app/i18n/locale.en.yaml
	goi18n merge -outdir ./internal/app/i18n -format yaml ./internal/app/i18n/active.en.yaml ./internal/app/i18n/locale.ja.yaml

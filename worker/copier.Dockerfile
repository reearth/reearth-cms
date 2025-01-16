FROM golang:1.23.3 AS build

WORKDIR /app

COPY go.work go.work.sum /app/
COPY server/go.mod server/go.sum server/main.go /app/server/
COPY worker/go.mod worker/go.sum worker/main.go /app/worker/

RUN go mod download

COPY server/pkg/ /app/server/pkg/
COPY worker/cmd/ /app/worker/cmd/
COPY worker/internal/ /app/worker/internal/
COPY worker/pkg/ /app/worker/pkg/

RUN CGO_ENABLED=0 go build -trimpath ./worker/cmd/copier

FROM scratch

COPY --from=build /app/copier /app/copier

WORKDIR /app

ENTRYPOINT ["/copier"]
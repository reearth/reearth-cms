FROM golang:1.23.3 AS build

WORKDIR /app

COPY go.work go.work.sum ./
COPY server/go.mod server/go.sum server/main.go ./server/
COPY worker/go.mod worker/go.sum worker/main.go ./worker/

RUN go mod download

COPY server/pkg/ ./server/pkg/
COPY worker/cmd/ ./worker/cmd/
COPY worker/internal/ ./worker/internal/
COPY worker/pkg/ ./worker/pkg/

RUN CGO_ENABLED=0 go build -trimpath -o copier ./worker/cmd/copier

FROM scratch

COPY --from=build /app/copier /copier

ENTRYPOINT ["/copier"]
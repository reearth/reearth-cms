FROM golang:1.24.0-alpine AS build

RUN apk add --update --no-cache ca-certificates

COPY go.work go.work.sum /app/
COPY server/go.mod server/go.sum server/main.go /app/server/
COPY worker/go.mod worker/go.sum worker/main.go /app/worker/

WORKDIR /app

RUN go mod download

COPY server/pkg/ /app/server/pkg/
COPY worker/cmd/ /app/worker/cmd/
COPY worker/internal/ /app/worker/internal/
COPY worker/pkg/ /app/worker/pkg/

RUN CGO_ENABLED=0 go build -trimpath -o copier ./worker/cmd/copier

FROM scratch

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /app/copier /copier

ENTRYPOINT ["/copier"]
FROM golang:1.27.3-alpine AS build

RUN apk add --update --no-cache ca-certificates

# Built from the repository root so the shared module is available.
COPY shared/go.mod /app/shared/
COPY worker/go.mod worker/go.sum worker/main.go /app/worker/

WORKDIR /app/worker

RUN go mod download

COPY shared/ /app/shared/
COPY worker/cmd/ /app/worker/cmd/
COPY worker/internal/ /app/worker/internal/
COPY worker/pkg/ /app/worker/pkg/

RUN CGO_ENABLED=0 go build -trimpath -o /app/copier ./cmd/copier

FROM scratch

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /app/copier /copier

ENTRYPOINT ["/copier"]

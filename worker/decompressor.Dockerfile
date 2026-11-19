FROM golang:1.27.2 AS build
# Built from the repository root so the shared module is available.
COPY shared/go.mod /app/shared/
COPY worker/go.mod worker/go.sum /app/worker/
WORKDIR /app/worker
RUN go mod download

COPY shared/ /app/shared/
COPY worker/ /app/worker/
RUN CGO_ENABLED=0 go build -o /app/decompressor ./cmd/decompressor

FROM ghcr.io/reearth/gcs-unzip:v0.1.10
COPY --from=build /app/decompressor /decompressor
ENTRYPOINT ["/decompressor", "/gcs-unzip"]

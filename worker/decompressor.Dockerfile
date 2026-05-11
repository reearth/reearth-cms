FROM golang:1.26.2 AS build
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build ./cmd/decompressor

FROM ghcr.io/reearth/gcs-unzip:v0.1.10
COPY --from=build /app/decompressor /decompressor
ENTRYPOINT ["/decompressor", "/gcs-unzip"]

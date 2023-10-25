FROM golang:1.21 AS build
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build ./cmd/decompressor

FROM ghcr.io/orisano/gcs-unzip:v0.1.7
COPY --from=build /app/decompressor /decompressor
ENTRYPOINT ["/decompressor", "/gcs-unzip"]

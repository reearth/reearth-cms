FROM golang:1.23.3 AS build
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build ./cmd/copier

FROM scratch
COPY --from=build /app/copier /copier
ENTRYPOINT ["/copier"]
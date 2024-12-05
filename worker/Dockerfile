FROM golang:1.23.3-alpine AS build
ARG TAG=release
ARG REV
ARG VERSION

RUN apk add --update --no-cache git ca-certificates build-base

COPY go.work go.work.sum server/go.mod server/go.sum server/main.go worker/go.mod worker/go.sum worker/main.go /app/
WORKDIR /app
RUN go mod download

COPY worker/cmd/ /app/worker/cmd/
COPY worker/internal/ /app/worker/internal/
COPY worker/pkg/ /app/worker/pkg/

RUN CGO_ENABLED=0 go build -tags "${TAG}" "-ldflags=-X main.version=${VERSION} -s -w -buildid=" -trimpath ./worker/cmd/reearth-cms-worker

FROM scratch

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /app/worker/reearth-cms-worker /app/reearth-cms-worker

WORKDIR /app

CMD [ "./reearth-cms-worker" ]

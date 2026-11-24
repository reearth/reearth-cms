FROM golang:1.27.3-alpine AS build
ARG TAG=release
ARG REV
ARG VERSION

RUN apk add --update --no-cache git ca-certificates build-base mailcap

# Built from the repository root so the shared module is available.
COPY shared/go.mod /app/shared/
COPY server/go.mod server/go.sum server/main.go /app/server/
WORKDIR /app/server
RUN go mod download

COPY shared/ /app/shared/
COPY server/cmd/ /app/server/cmd/
COPY server/pkg/ /app/server/pkg/
COPY server/internal/ /app/server/internal/
COPY server/i18n/ /app/server/i18n/

RUN CGO_ENABLED=0 go build -tags "${TAG}" "-ldflags=-X main.version=${VERSION} -s -w -buildid=" -trimpath -o /app/reearth-cms ./cmd/reearth-cms
RUN CGO_ENABLED=0 go build "-ldflags=-s -w -buildid=" -trimpath -o /app/db-migrations ./cmd/db-migrations

FROM scratch

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /etc/mime.types /etc/mime.types
COPY --from=build /app/reearth-cms /app/reearth-cms
COPY --from=build /app/db-migrations /app/db-migrations

ENTRYPOINT [ "/app/reearth-cms" ]

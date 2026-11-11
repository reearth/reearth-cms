# Re:Earth CMS

A tailor-made CMS platform for GIS data.

## Contributing

Before contributing, please make sure you look over the Re:Earth front-end style guide [here](https://github.com/reearth/guides/blob/main/frontend/style.md).

## Login with a generic OIDC provider

CMS web can log in against any OpenID Connect provider (Dex, Keycloak, Zitadel,
Authentik, Okta, Entra ID, ...) using Authorization Code with PKCE. In `web/.env`, set:

```env
REEARTH_CMS_AUTH_PROVIDER=oidc
REEARTH_CMS_OIDC_AUTHORITY=<issuer URL>
REEARTH_CMS_OIDC_CLIENT_ID=<public client id>
# Optional
REEARTH_CMS_OIDC_SCOPE="openid profile email offline_access"   # default
REEARTH_CMS_OIDC_AUDIENCE=                                      # sent as `audience` on the authorize request
REEARTH_CMS_OIDC_TOKEN_TYPE=id_token                            # or access_token
```

The issuer must serve `/.well-known/openid-configuration`. Register CMS as a
**public** client (no secret) with the redirect URI `http://localhost:3000`
(plus `/auth/<tenant>` for each tenant) and allow that origin for CORS. The same
URL is used as the post-logout redirect URI.

CMS sends the token selected by `REEARTH_CMS_OIDC_TOKEN_TYPE` as its API bearer
credential. The default `id_token` works with every provider (its audience is the
client id). Use `access_token` only when the provider issues JWT access tokens for
CMS (e.g. Keycloak, or Auth0/Okta with `REEARTH_CMS_OIDC_AUDIENCE`). Configure the
CMS server to verify that token:

```env
REEARTH_CMS_AUTH_ISS=<issuer URL>
REEARTH_CMS_AUTH_AUD=<client id, or the access token audience>
REEARTH_CMS_AUTH_JWKSURI=<jwks_uri from the discovery document>
```

Sessions are kept in session storage and renewed silently with the refresh token
(`offline_access`). Logout redirects to the provider's `end_session_endpoint` when
the discovery document advertises one; otherwise (e.g. Dex) only the CMS session
is cleared. For multitenant configurations set `authProvider: "oidc"` and the
`oidc*` fields on the tenant. Runtime `reearth_config.json` accepts the same
fields (`oidcAuthority`, `oidcClientId`, `oidcScope`, `oidcAudience`,
`oidcTokenType`) and overrides build-time settings. If the browser and server run
in containers, both must reach the issuer URL, which must match the provider's
issuer exactly.

### Example: Dex

```yaml
issuer: http://localhost:5556/dex
web:
  http: 0.0.0.0:5556
  allowedOrigins:
    - http://localhost:3000
staticClients:
  - id: cms-local
    name: CMS Local
    public: true
    redirectURIs:
      - http://localhost:3000
```

with `REEARTH_CMS_OIDC_AUTHORITY=http://localhost:5556/dex`,
`REEARTH_CMS_OIDC_CLIENT_ID=cms-local`, and on the server
`REEARTH_CMS_AUTH_JWKSURI=http://localhost:5556/dex/keys`.

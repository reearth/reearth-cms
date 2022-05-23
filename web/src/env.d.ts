/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REEARTH_CMS_API: string;
  readonly REEARTH_CMS_AUTH0_DOMAIN: string;
  readonly REEARTH_CMS_AUTH0_AUDIENCE: string;
  readonly REEARTH_CMS_AUTH0_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

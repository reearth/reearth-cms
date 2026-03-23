/* eslint-disable import/first */
// Polyfill `global` for libraries like aws-amplify that expect Node.js globals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).global ??= globalThis;

import "@reearth-cms/i18n/i18n";

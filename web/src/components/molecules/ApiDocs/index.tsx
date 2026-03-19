import styled from "@emotion/styled";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { AnyApiReferenceConfiguration, ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { FC, useMemo } from "react";

export type Props = {
  specContent?: Record<string, unknown>;
  specUrl?: string;
  className?: string;
};

const ApiDocs: FC<Props> = ({ specContent, specUrl, className }) => {
  const configuration = useMemo<AnyApiReferenceConfiguration>(
    () => ({
      agent: { disabled: true },
      spec: specContent ? { content: specContent } : undefined,
      url: specContent ? undefined : specUrl,
      customCss: /* css */ `
        [data-v-app] { height: 100%; }
        [data-v-app] > div { height: 100%; }
        .scalar-api-reference { --full-height: 100% !important; min-height: 100% !important; height: 100%; }
        .scalar-app .h-dvh { height: 100%; display: flex; }
        .scalar-app .min-h-dvh { min-height: 100%; }
        .scalar-app .t-doc__sidebar { height: 100%; }
        .scalar-app > aside { flex-shrink: 0; overflow-y: auto; }
        .scalar-app > main { flex-grow: 1; overflow-y: auto; }
      `,
      hideModels: false,
      hideDownloadButton: false,
      darkMode: false,
      forceDarkModeState: "light" as const,
      hideDarkModeToggle: true,
      hideClientButton: false,
      showDeveloperTools: "never" as const,
    }),
    [specContent, specUrl],
  );

  if (!specContent && !specUrl) return null;

  return (
    <ApiDocsWrapper className={className} data-testid={DATA_TEST_ID.ApiDocs__ApiDocsWrapper}>
      <ApiReferenceReact configuration={configuration} />
    </ApiDocsWrapper>
  );
};

export default ApiDocs;

const ApiDocsWrapper = styled.div`
  height: 100%;
  overflow: hidden;
`;

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { FC } from "react";

export type Props = {
  specUrl: string;
  className?: string;
};

const ApiDocs: FC<Props> = ({ specUrl, className }) => {
  return (
    <div className={className}>
      <ApiReferenceReact
        configuration={{
          spec: {
            url: specUrl,
          },
          customCss: `.scalar-app .h-dvh { height: calc(100dvh - 48px); }`,
          hideModels: false,
          hideDownloadButton: false,
          darkMode: false,
          hideDarkModeToggle: true,
          hideClientButton: true,
          showToolbar: "never",
        }}
      />
    </div>
  );
};

export default ApiDocs;

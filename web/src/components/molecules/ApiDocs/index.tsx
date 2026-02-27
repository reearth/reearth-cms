import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { FC } from "react";

export type Props = {
  className?: string;
  specUrl: string;
};

const ApiDocs: FC<Props> = ({ className, specUrl }) => {
  return (
    <div className={className}>
      <ApiReferenceReact
        configuration={{
          customCss: `.scalar-app .h-dvh { height: calc(100dvh - 48px); }`,
          darkMode: false,
          forceDarkModeState: "light",
          hideClientButton: true,
          hideDarkModeToggle: true,
          hideDownloadButton: false,
          hideModels: false,
          showToolbar: "never",
          spec: {
            url: specUrl,
          },
        }}
      />
    </div>
  );
};

export default ApiDocs;

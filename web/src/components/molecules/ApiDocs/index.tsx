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
          url: specUrl,
          customCss: `.scalar-app .h-dvh { height: calc(100dvh - 48px); }`,
          hideModels: false,
          hideDownloadButton: false,
          darkMode: false,
          forceDarkModeState: "light",
          hideDarkModeToggle: true,
          hideClientButton: true,
          showDeveloperTools: "never",
        }}
      />
    </div>
  );
};

export default ApiDocs;

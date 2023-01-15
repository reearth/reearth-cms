import { JSONTree } from "react-json-tree";

import Button from "@reearth-cms/components/atoms/Button";

type Props = {
  infoBoxProps: any;
  infoBoxVisibility: boolean;
  title?: string;
  onClose: () => void;
};

const InfoBox: React.FC<Props> = ({ infoBoxProps, infoBoxVisibility, title, onClose }) => {
  const theme = {
    base00: "#272822",
    base01: "#383830",
    base02: "#49483e",
    base03: "#75715e",
    base04: "#a59f85",
    base05: "#f8f8f2",
    base06: "#f5f4f1",
    base07: "#f9f8f5",
    base08: "#f92672",
    base09: "#fd971f",
    base0A: "#f4bf75",
    base0B: "#a6e22e",
    base0C: "#a1efe4",
    base0D: "#66d9ef",
    base0E: "#ae81ff",
    base0F: "#cc6633",
  };

  return (
    <>
      infoBoxVisibility && (
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 350,
          height: 250,
          textAlign: "left",
          overflow: "scroll",
          backgroundColor: infoBoxVisibility ? theme.base00 : "transparent",
        }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ marginBottom: 0, color: "white", marginLeft: 10, fontSize: 12 }}>{title}</p>
          <Button type="link" size="large" onClick={onClose}>
            &times;
          </Button>
        </div>
        <JSONTree data={infoBoxProps ?? {}} theme={theme} />
      </div>
      )
    </>
  );
};

export default InfoBox;

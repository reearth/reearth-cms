import styled from "@emotion/styled";
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
      {infoBoxVisibility && (
        <InfoBoxWrapper color={theme.base00}>
          <Header>
            <Title>{title}</Title>
            <Button type="link" size="large" onClick={onClose}>
              &times;
            </Button>
          </Header>
          <JSONTree data={infoBoxProps ?? {}} theme={theme} />
        </InfoBoxWrapper>
      )}
    </>
  );
};

const InfoBoxWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 350px;
  height: 250px;
  text-align: left;
  overflow: scroll;
  background-color: ${({ color }) => color};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  margin-bottom: 0;
  color: white;
  margin-left: 10px;
  font-size: 12px;
`;

export default InfoBox;

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
    base00: "#fff",
    base01: "#1d1d1d",
    base02: "#1d1d1d",
    base03: "#1d1d1d",
    base04: "#1d1d1d",
    base05: "#1d1d1d",
    base06: "#1d1d1d",
    base07: "#1d1d1d",
    base08: "#1d1d1d",
    base09: "#1d1d1d",
    base0A: "#1d1d1d",
    base0B: "#1d1d1d",
    base0C: "#1d1d1d",
    base0D: "#1d1d1d",
    base0E: "#1d1d1d",
    base0F: "#1d1d1d",
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
          <Box>
            <JSONTree data={infoBoxProps ?? {}} theme={theme} />
          </Box>
        </InfoBoxWrapper>
      )}
    </>
  );
};

const InfoBoxWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40%;
  height: 90%;
  max-width: 500px;
  max-height: 800px;
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

const Box = styled.div`
  margin: 10px;
`;

export default InfoBox;
